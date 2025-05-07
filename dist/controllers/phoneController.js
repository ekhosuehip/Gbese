"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyNumber = exports.userIdentity = void 0;
const otp_1 = require("../utils/otp");
const redis_1 = require("../config/redis");
const nanoid_1 = require("nanoid");
const nomberFormat_1 = require("../utils/nomberFormat");
const userServices_1 = __importDefault(require("../services/userServices"));
//Get OTP
const userIdentity = async (req, res, next) => {
    const { phone } = req.body;
    const phoneNumber = (0, nomberFormat_1.formatPhoneNumber)(phone);
    try {
        const existingUser = await userServices_1.default.fetchUser(phoneNumber);
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'Phone number already registered'
            });
            return;
        }
        // Send OTP
        const otpResponse = await (0, otp_1.sendOTP)(phoneNumber);
        if (!otpResponse || !otpResponse.pinId) {
            res.status(500).json({
                success: false,
                message: "Failed to send OTP.",
            });
            return;
        }
        //Generate random ID 
        const generateCustomId = (0, nanoid_1.customAlphabet)('abcdefghijklmnopqrstuvwxyz0123456789', 10);
        const redisId = generateCustomId();
        console.log("OTP response received:", otpResponse);
        console.log("Redis ID generated:", redisId);
        // Save to Redis (atomic way)
        const pipeline = redis_1.client.multi();
        pipeline.hSet(redisId, {
            otpId: otpResponse.pinId,
            phoneNumber: otpResponse.phone_number,
            attempts: "0",
        });
        pipeline.expire(redisId, 600); // expires in 10 minutes
        await pipeline.exec();
        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            key: redisId
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while sending OTP.",
            error: error.response?.data || error.message
        });
        return;
    }
};
exports.userIdentity = userIdentity;
//verify OTP
const verifyNumber = async (req, res, next) => {
    const { otp, key } = req.body;
    try {
        const data = await redis_1.client.hGetAll(key);
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
                message: "Too many incorrect attempts. OTP verification blocked. Try in 10 mins",
            });
            return;
        }
        const verify = await (0, otp_1.verifyOTP)(data.otpId, otp);
        if (!verify || verify.verified !== true) {
            const newAttempts = attempts + 1;
            await redis_1.client.hSet(key, { attempts: newAttempts.toString() });
            res.status(400).json({
                success: false,
                message: `Invalid or Expired OTP. Attempt ${newAttempts} of 5.`,
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "OTP verified successfully.",
            key: key
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred during verification.",
            error: error.response?.data || error.message,
        });
        return;
    }
};
exports.verifyNumber = verifyNumber;
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
