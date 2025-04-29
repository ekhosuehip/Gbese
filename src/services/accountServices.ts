import Account from "../models/accountModel";
import { IAccount } from "../interfaces/banks";


class AccountService {
    //Create user account 
    async createAccount (data: IAccount) {
        return await Account.create(data)
    }
}

const accServices = new AccountService
export default accServices