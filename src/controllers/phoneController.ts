import { Request, Response, NextFunction } from "express";
import {sendOTP, verifyOTP} from "../utils/otp";
import client from "../config/redis";
import { customAlphabet } from 'nanoid';

//Get OTP
export const userNumber = async (req: Request, res: Response, next: NextFunction) => {
    const phoneNumber = req.body.phone;
    console.log("ok");
    
    try {

      
      // Send OTP
      const otpResponse = await sendOTP(phoneNumber);

      if (!otpResponse || !otpResponse.pinId) {
        res.status(500).json({
          success: false,
          message: "Failed to send OTP.",
        });
        return;
      }

      //Generate random ID 
      const generateCustomId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);
      const redisId = generateCustomId();

      // Save to Redis
      await client.hSet(redisId, {
        id: otpResponse.pinId,
        phoneNumber: otpResponse.phone_number,
        attempts: "0",
      });
      await client.expire(redisId, 3600); // set expiration to 1 hour

    // Respond to user
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      key: redisId
    });
    return;

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "An error occurred while sending OTP.",
      error: error.response?.data || error.message
    });
  }
};

//verify OTP
export const verifyNumber = async (req: Request, res: Response) => {
  const { otp, key } = req.body;

  try {

    const data = await client.hGetAll(key);

    console.log("Redis data:", data);
    console.log("Keys:", Object.keys(data));

    
    if (!data || Object.keys(data).length === 0) {
      res.status(400).json({
        success: false,
        message: "OTP session not found or expired.",
      });
      return;
    }

    const attempts = parseInt(data.attempts || "0");
    if (attempts >= 5) {
      res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. OTP verification blocked.",
      });
      return;
    }

    const verified = await verifyOTP(data.id, otp);
    if (!verified) {
      await client.hSet(key, { attempts: (attempts + 1).toString() });

      res.status(400).json({
        success: false,
        message: `Invalid or Expired OTP. Attempt ${attempts + 1} of 5.`,
      });
      return;
    }
    console.log(verified, "this");
    
    // Cleanup on success
    await client.del(key);

    res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "An error occurred during verification.",
      error: error.response?.data || error.message,
    });
    return;
  }
};
