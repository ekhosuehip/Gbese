import PhoneNumber from "../models/phoneModel";


class UserServices {
    //Save phone number
    async savePhone (phoneNumber: string) {
        return await PhoneNumber.create({phone: phoneNumber})
    }

    //Find existing number
    async fetchNumber(phoneNumber: string) {
        return await PhoneNumber.findOne({phone: phoneNumber})
    }
};

const userServices = new UserServices;
export default userServices;