import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel'; 

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // To check if user exists
    const user = await User.findOne({ email });
    if (!user) {
     res.status(400).json({ success: false, message: 'Invalid credentials' });
     return;
    }

    // To Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // To generate JWT 
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '20m' }
    );

    // To set the token in a cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // To secure only in productions
      sameSite: 'strict',
      maxAge: 20 * 60 * 1000 
    }).status(200).json({
      success: true,
      message: 'Login successful',
      token, 
      user: {
        id: user._id,
        email: user.email,
        Name: user.Name,
      }
    });
    return;
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
    return;
  }
};
