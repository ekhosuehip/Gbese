import User from "../models/userModel";
import {IUser} from '../interfaces/user';
import client from '../config/redis';

class UserServices {
    // Register new user
    async register (data: IUser) {
        return await User.create(data)
    }

    async fetchUser(detail: string) {
        // Check if the detail is an email or phone number by regex
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(detail);
        const isPhoneNumber = /^[0-9]{10}$/.test(detail);

        if (isEmail) {
            return await User.findOne({ email: detail });
        } else if (isPhoneNumber) {
            return await User.findOne({ phoneNumber: detail });
        } else {
            throw new Error("Invalid email or phone number format");
        }
    }

      // Save the reset token and expiry in Redis
    async saveResetToken(email: string, token: string, expiry: number) {
    try {
      await client.hSet(email, {
        resetToken: token,
        resetTokenExpiry: expiry.toString(),
      });
      await client.expire(email, 3600); // Set expiry to 1 hour
    } catch (error) {
      console.error('Error saving reset token:', error);
      throw new Error('Could not save reset token');
    }
    }
    // Verify the reset token
    async verifyResetToken(email: string, token: string) {
        try {
          // Retrieve the token and expiry from Redis
          const data = await client.hGetAll(email);
    
          if (!data || !data.resetToken || !data.resetTokenExpiry) {
            return null; // Token not found
          }
    
          // Check if the token matches
          if (data.resetToken !== token) {
            return null; // Token mismatch
          }
    
          // Check if the token is expired
          if (Date.now() > parseInt(data.resetTokenExpiry)) {
            return null; // Token expired
          }
    
          return true; // Token is valid
        } catch (error) {
          console.error('Error verifying reset token:', error);
          throw new Error('Could not verify reset token');
        }
    }
    
    // Update the user's password
    async updatePassword(email: string, hashedPassword: string) {
    try {
      // Update the password in the database
      const user = await client.hGetAll(email);
      if (!user) {
        throw new Error('User not found');
      }

      await client.hSet(email, { password: hashedPassword });
    } catch (error) {
      console.error('Error updating password:', error);
      throw new Error('Could not update password');
    }
  }
};




const userServices = new UserServices;
export default userServices;