import User from "../models/userModel";
import {IUser} from '../interfaces/user';
import {client} from "../config/redis";


class UserServices {
    // Register new user
    async register (data: IUser) {
        return await User.create(data)
    }

    // fetch by id
    async fetchUserById (id: string) {
        return await User.findById(id)
    }

    
    async fetchUser(identifier: string) {
        const isEmail = identifier.includes('@');
        const query = isEmail ? { email: identifier } : { phoneNumber: identifier };
        return await User.findOne(query);
    }

    async fetchAllUsers() {
        return await User.find({});
    }

    // Update file
    async updateProfile (id: string, data: Partial<IUser>) {
        return await User.findByIdAndUpdate(id, data, {new: true});
    }

  
    // Save the reset token and expiry in Redis
    async saveResetToken(email: string, token: string, expiry: number) {
        try {
            await client.hSet(email, {
            resetToken: token,
            resetTokenExpiry: expiry.toString(),
            });
            await client.expire(email, 3600); // Set expiry for the token in Redis (1 hour)
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