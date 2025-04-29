import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userServices from '../services/userServices';
import { IAuthPayload, IUser } from '../interfaces/user';
import client from "../config/redis";
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';


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
    const phoneNumber = data.phone_number

    // Check if user already exists by either email or phone number
    const existingUser = await userServices.fetchUser(email || phoneNumber);

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User already exists with this email or phone number.",
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

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  const {key, role} = req.body;

  try {
    // Fetch existing Redis data
    const data = await client.hGetAll(key);

    if (!data || Object.keys(data).length === 0) {
      res.status(400).json({
        success: false,
        message: "Wrong or invalid key.",
      });
      return;
    }

    console.log(data);
    const accountNumber = data.phoneNumber.slice(3);
 
    // Save the new user
    const newUser: IUser = {
      accNumber: accountNumber,
      phoneNumber: data.phoneNumber,
      fullName: data.name,
      email: data.email,
      password: data.password,
      dateOfBirth: data.DOB,
      gender: data.sex,
      role: role,
    }
    const user = await userServices.register(newUser);

    // To generate JWT
    const payload: IAuthPayload = {fullName: user.fullName, email: user.email};

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1hr' });

    // To set the token in a cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // To secure only in productions
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 
    }).status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        accountNumber: accountNumber,
        name: user.fullName
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false, 
      message: 'Internal server error' });
    return;
  }
}

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

    // To Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({
        success: false, 
        message: 'Invalid credentials' });
      return;
    }

    // To generate JWT
    const payload: IAuthPayload = {fullName: user.fullName, email: email};

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
      name: user.fullName
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
      { email: user.email }, // Payload
      process.env.JWT_SECRET as string, // Secret key
      { expiresIn: '1h' } // Token expiration (1 hour)
    );

    // Save the token and expiry in the database (or Redis)
    const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour
    await userServices.saveResetToken(email, resetToken, resetTokenExpiry);

    // Create a reset link
    const resetLink = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Use your email provider
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
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