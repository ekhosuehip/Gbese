import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userServices from '../services/userServices';
import accServices from '../services/accountServices';
import { IAuthPayload, IUser } from '../interfaces/user';
import client from "../config/redis";
import dotenv from 'dotenv';
import { IAccount } from '../interfaces/banks';

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
// Sign up
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
      phoneNumber: data.phoneNumber,
      fullName: data.name,
      email: data.email,
      password: data.password,
      dateOfBirth: data.DOB,
      gender: data.sex,
      role: role,
    }

    const gbeseCoins = role === "benefactor" ? 2000 : 3500;

    const user = await userServices.register(newUser);

    //Create new acc
    const accData: IAccount = {
      _id: user._id,
      coins: gbeseCoins,
      accNumber: accountNumber,
      balance: 0.00,
      creditLimit: 50000
    }
    const userAccount = await accServices.createAccount(accData)

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
      name: user.fullName,
      Account_Data: userAccount
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
