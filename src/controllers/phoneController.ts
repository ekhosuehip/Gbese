import { Request, Response, NextFunction } from "express";
import {sendOTP, verifyOTP} from "../utils/otp";
import {client} from "../config/redis";
import { customAlphabet } from 'nanoid';
import {formatPhoneNumber} from '../utils/nomberFormat';
import userServices from "../services/userServices";

//Get OTP
export const userIdentity = async (req: Request, res: Response, next: NextFunction) => {
    const { phone } = req.body;
    const phoneNumber = formatPhoneNumber(phone)
    
    try {
      const existingUser = await userServices.fetchUser(phoneNumber);

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already registered'
        })
      }
      // Send OTP
      const otpResponse = await sendOTP(phoneNumber);

      if (!otpResponse || !otpResponse.pinId) {
        return res.status(500).json({
          success: false,
          message: "Failed to send OTP.",
        });
      }

      //Generate random ID 
      const generateCustomId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);
      const redisId = generateCustomId();

      console.log("OTP response received:", otpResponse);
      console.log("Redis ID generated:", redisId);


      // Save to Redis (atomic way)
      const pipeline = client.multi();
      pipeline.hSet(redisId, {
        otpId: otpResponse.pinId,
        phoneNumber: otpResponse.phone_number,
        attempts: "0",
      });
      pipeline.expire(redisId, 600); // expires in 10 minutes
      await pipeline.exec();

      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        key: redisId
      });
  } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while sending OTP.",
        error: error.response?.data || error.message
      });
  }
};

//verify OTP
export const verifyNumber = async (req: Request, res: Response, next: NextFunction) => {
  const { otp, key } = req.body;

  try {

    const data = await client.hGetAll(key);

    console.log("Redis data:", data);
    console.log("Keys:", Object.keys(data));
    
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP session not found or expired.",
      });
    }

    const attempts = parseInt(data.attempts || "0");
    if (attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. OTP verification blocked. Try in 10 mins",
      });
    }

    const verify = await verifyOTP(data.otpId, otp);

    if (!verify || verify.verified !== true) {
      const newAttempts = attempts + 1;
      await client.hSet(key, { attempts: newAttempts.toString() });

      return res.status(400).json({
        success: false,
        message: `Invalid or Expired OTP. Attempt ${newAttempts} of 5.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      key: key
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "An error occurred during verification.",
      error: error.response?.data || error.message,
    });
  }
};

// export const forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
//   const { email } = req.body;

//   try {
//     // To check if user exists
//     const user = await userServices.fetchUser(email);
//     if (!user) {
//      res.status(400).json({ 
//           success: false, 
//           message: 'No user found' });
//      return;
//     }
//     const userId = user._id.toString();
//     const response = await sendEmail(email, userId);
//     res.status(200).json({
//       success: true,
//       message: 'Email sent successfully',
//       data: response
//     })
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     })
//     console.log(error);
    
//     return
//   }
// }
