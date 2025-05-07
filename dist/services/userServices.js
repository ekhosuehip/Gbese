"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../models/userModel"));
const redis_1 = require("../config/redis");
class UserServices {
    // Register new user
    async register(data) {
        return await userModel_1.default.create(data);
    }
    async fetchUser(identifier) {
        const isEmail = identifier.includes('@');
        const query = isEmail ? { email: identifier } : { phoneNumber: identifier };
        return await userModel_1.default.findOne(query);
    }
    async fetchAllUsers() {
        return await userModel_1.default.find({});
    }
    // Save the reset token and expiry in Redis
    async saveResetToken(email, token, expiry) {
        try {
            await redis_1.client.hSet(email, {
                resetToken: token,
                resetTokenExpiry: expiry.toString(),
            });
            await redis_1.client.expire(email, 3600); // Set expiry for the token in Redis (1 hour)
        }
        catch (error) {
            console.error('Error saving reset token:', error);
            throw new Error('Could not save reset token');
        }
    }
    // Verify the reset token
    async verifyResetToken(email, token) {
        try {
            // Retrieve the token and expiry from Redis
            const data = await redis_1.client.hGetAll(email);
            if (!data || !data.resetToken || !data.resetTokenExpiry) {
                return null;
            }
            // Check if the token matches
            if (data.resetToken !== token) {
                return null;
            }
            // Check if the token is expired
            if (Date.now() > parseInt(data.resetTokenExpiry)) {
                return null;
            }
            return true;
        }
        catch (error) {
            console.error('Error verifying reset token:', error);
            throw new Error('Could not verify reset token');
        }
    }
    // Update the user's password
    async updatePassword(email, hashedPassword) {
        try {
            // Update the password in the database
            const user = await redis_1.client.hGetAll(email);
            if (!user) {
                throw new Error('User not found');
            }
            await redis_1.client.hSet(email, { password: hashedPassword });
        }
        catch (error) {
            console.error('Error updating password:', error);
            throw new Error('Could not update password');
        }
    }
}
;
const userServices = new UserServices;
exports.default = userServices;
