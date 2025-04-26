import User from "../models/userModel";
import {IUser} from '../interfaces/user';

class userServices {
    // Register new user
    async register (data: IUser) {
        return await User.create(data)
    }

    // Get user
    async fetchUser (email: string) {
        return await User.findOne({email: email})
    }
}