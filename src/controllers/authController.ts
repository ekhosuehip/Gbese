import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userServices from '../services/userServices';
import accServices from '../services/accountServices';
import statsService from '../services/statsServices';
import { IAuthPayload, IUser } from '../interfaces/user';
import {client} from "../config/redis";
import dotenv from 'dotenv';
import { IAccount, IInvestorStats } from '../interfaces/banks';
import nodemailer from 'nodemailer';
import { IStats } from '../interfaces/activities';

dotenv.config();


// To register a user
export const userData = async (req: Request, res: Response, next: NextFunction) => {
  const { key, fullName, email, password, dateOfBirth, gender } = req.body;
  try {
    // Fetch existing Redis data
    const data = await client.hGetAll(key);
    console.log(data);
    

    if (!data || Object.keys(data).length === 0) {
      res.status(400).json({
        success: false,
        message: "Wrong or invalid key.",
      });
      return;
    }

    // Check if email already exists 
    const existingUser = await userServices.fetchUser(email);

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User already exists with this email.",
      });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    const dobString = new Date(dateOfBirth).toISOString().split('T')[0];

    // Save details to Redis
    const pipeline = client.multi();

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
    })

  } catch (error) {
    console.error('Sign-up error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
    return;
  }
};


// Sign up
export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  const { key, type } = req.body;

  try {
    // Fetch existing Redis data
    const data = await client.hGetAll(key);

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
    const newUser: IUser = {
      phoneNumber: data.phoneNumber,
      fullName: data.name,
      email: data.email,
      password: data.password,
      dateOfBirth: data.DOB,
      gender: data.sex,
      type: type,
    };

    // Register user first to get the ID
    const user = await userServices.register(newUser);

    // Assign coins based on role
    const gbeseCoins = type === "beneficiary" ? 500 : 600;

    // Create account data
    let accData: IAccount | IInvestorStats;

    if (type === "beneficiary") {
      const beneficiaryAccount: IAccount = {
        _id: user._id,
        type: 'beneficiary',
        coins: gbeseCoins,
        accNumber: accountNumber,
        balance: 0.00,
        creditLimit: 50000,
      };

      accData = beneficiaryAccount;
    } else {
      const benefactorAccount: IInvestorStats = {
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
    const userAccount = await accServices.createAccount(accData);

    const statsDate: IStats = {
      user: user._id,
      debtTransfers: 0,
      helped: 0,
      successRate: 0,
      responseTime: 0,
      repeatCase: 0
    }
    await statsService.createStats(statsDate)

    // JWT payload
    const payload: IAuthPayload = {
      userId: user._id,
      fullName: user.fullName,
      email: user.email
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1hr' });

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

  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


// To login a user
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // To check if user exists
    const user = await userServices.fetchUser(email);
    if (!user) {
     res.status(400).json({ 
          success: false, 
          message: 'Invalid credentials' });
     return;
    }

    // fetch user account details
    const accData = await accServices.fetchAccount(user._id)
    console.log(accData);

    // To Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({
        success: false, 
        message: 'Invalid credentials' });
      return;
    }

    // To generate JWT
    const payload: IAuthPayload = {userId: user._id, fullName: user.fullName, email: email};

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1hr' });

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
      Account_Data: accData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false, 
      message: 'Internal server error' });
    return;
  }
};
  
//forgot password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const user = await userServices.fetchUser(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User with this email does not exist',
      });
    }

    // Generate a reset token using jsonwebtoken
    const resetToken = jwt.sign(
      { email: user.email }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '1h' } // Token expiration (1 hour)
    );

    // Save the token and expiry on Redis
    const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour
    await userServices.saveResetToken(email, resetToken, resetTokenExpiry);

    // Create a reset link
    const resetLink = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: 'mail.gbese.com.ng',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
      }
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
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };

    // Fetch the user using the email from the token
    const user = await userServices.fetchUser(decoded.email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await userServices.updatePassword(user.email, hashedPassword);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
