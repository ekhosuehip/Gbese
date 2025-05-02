import User from "../models/userModel";
import {IUser} from '../interfaces/user';
import { date } from "joi";

class UserServices {
    // Register new user
    async register (data: IUser) {
        return await User.create(data)
    }

    async fetchUser(identifier: string) {
        const isEmail = identifier.includes('@');
        const query = isEmail ? { email: identifier } : { phoneNumber: identifier };
        return await User.findOne(query);
    }


};

const userServices = new UserServices;
export default userServices;