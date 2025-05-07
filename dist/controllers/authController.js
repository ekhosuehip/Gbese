"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.login = exports.signUp = exports.userData = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userServices_1 = __importDefault(require("../services/userServices"));
const accountServices_1 = __importDefault(require("../services/accountServices"));
const redis_1 = require("../config/redis");
const dotenv_1 = __importDefault(require("dotenv"));
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config();
// To register a user
const userData = async (req, res, next) => {
    const { key, fullName, email, password, dateOfBirth, gender } = req.body;
    try {
        // Fetch existing Redis data
        const data = await redis_1.client.hGetAll(key);
        console.log(data);
        if (!data || Object.keys(data).length === 0) {
            res.status(400).json({
                success: false,
                message: "Wrong or invalid key.",
            });
            return;
        }
        // Check if email already exists 
        const existingUser = await userServices_1.default.fetchUser(email);
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: "User already exists with this email.",
            });
            return;
        }
        // Hash the password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        console.log(hashedPassword);
        const dobString = new Date(dateOfBirth).toISOString().split('T')[0];
        // Save details to Redis
        const pipeline = redis_1.client.multi();
        pipeline.hSet(key, {
            name: String(fullName),
            email: String(email),
            password: String(hashedPassword),
            DOB: dobString,
            sex: String(gender),
        });
        pipeline.expire(key, 300);
        await pipeline.exec();
        console.log(`User data saved successfully for key: ${key}`);
        res.status(200).json({
            success: true,
            message: 'continue registration',
            key: key
        });
    }
    catch (error) {
        console.error('Sign-up error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
        return;
    }
};
exports.userData = userData;
// Sign up
const signUp = async (req, res, next) => {
    const { key, type } = req.body;
    try {
        // Fetch existing Redis data
        const data = await redis_1.client.hGetAll(key);
        if (!data || Object.keys(data).length === 0) {
            res.status(400).json({
                success: false,
                message: "Wrong key.",
            });
            return;
        }
        console.log(data);
        const accountNumber = data.phoneNumber.slice(3);
        // Create user object
        const newUser = {
            phoneNumber: data.phoneNumber,
            fullName: data.name,
            email: data.email,
            password: data.password,
            dateOfBirth: data.DOB,
            gender: data.sex,
            type: type,
        };
        // Register user first to get the ID
        const user = await userServices_1.default.register(newUser);
        // Assign coins based on role
        const gbeseCoins = type === "beneficiary" ? 500 : 600;
        // Create account data
        let accData;
        if (type === "beneficiary") {
            const beneficiaryAccount = {
                _id: user._id,
                type: 'beneficiary',
                coins: gbeseCoins,
                accNumber: accountNumber,
                balance: 0.00,
                creditLimit: 50000,
            };
            accData = beneficiaryAccount;
        }
        else {
            const benefactorAccount = {
                _id: user._id,
                coins: gbeseCoins,
                accNumber: accountNumber,
                balance: 0.00,
                type: 'benefactor',
                amountInvested: 0,
                helped: 0,
                RIO: 0,
            };
            accData = benefactorAccount;
        }
        // Save account info
        const userAccount = await accountServices_1.default.createAccount(accData);
        // JWT payload
        const payload = {
            userId: user._id,
            fullName: user.fullName,
            email: user.email
        };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: '1hr' });
        // Set token cookie and return response
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000
        }).status(201).json({
            success: true,
            message: 'User registered successfully',
            name: user.fullName,
            Account_Data: userAccount
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.signUp = signUp;
// To login a user
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // To check if user exists
        const user = await userServices_1.default.fetchUser(email);
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        // fetch user account details
        const accData = await accountServices_1.default.fetchAccount(user._id);
        console.log(accData);
        // To Compare password
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        // To generate JWT
        const payload = { userId: user._id, fullName: user.fullName, email: email };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: '1hr' });
        // To set the token in a cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // To secure only in productions
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000
        }).status(200).json({
            success: true,
            message: 'Login successful',
            name: user.fullName,
            Account_Date: accData
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        return;
    }
};
exports.login = login;
//forgot password
const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        // Check if the user exists
        const user = await userServices_1.default.fetchUser(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User with this email does not exist',
            });
        }
        // Generate a reset token using jsonwebtoken
        const resetToken = jsonwebtoken_1.default.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' } // Token expiration (1 hour)
        );
        // Save the token and expiry on Redis
        const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour
        await userServices_1.default.saveResetToken(email, resetToken, resetTokenExpiry);
        // Create a reset link
        const resetLink = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
        // Configure Nodemailer
        const transporter = nodemailer_1.default.createTransport({
            service: 'Gmail', // Use your email service provider
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        // Send the email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>If you did not request this, please ignore this email.</p>`,
        });
        res.status(200).json({
            success: true,
            message: 'Password reset email sent successfully',
        });
    }
    catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.forgotPassword = forgotPassword;
// Reset password
const resetPassword = async (req, res, next) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    try {
        // Verify the token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Fetch the user using the email from the token
        const user = await userServices_1.default.fetchUser(decoded.email);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token',
            });
        }
        // Hash the new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // Update the user's password
        await userServices_1.default.updatePassword(user.email, hashedPassword);
        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        });
    }
    catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.resetPassword = resetPassword;
