import User from "../models/userModel";
import {IUser} from '../interfaces/user';

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

};

const userServices = new UserServices;
export default userServices;