import { Account, RegularAccount, InvestorAccount } from '../models/accountModel';
import { IAccount, IInvestorStats } from '../interfaces/banks';
import { isValidObjectId } from 'mongoose';


class AccountServices {
    async createAccount (data: IAccount | IInvestorStats) {
        if (data.type === 'beneficiary') {
            return await RegularAccount.create(data);
        } else if (data.type === 'benefactor') {
            return await InvestorAccount.create(data);
        } else {
            throw new Error('Invalid account type');
        }
    };

    async fetchAccount(identifier: string) {
        let query;

        if (/^\d{10,15}$/.test(identifier)) {
            query = { phoneNumber: identifier };
        } else if (isValidObjectId(identifier)) {
            query = { _id: identifier };
        } else {
            throw new Error('Invalid identifier. Must be a phone number or valid user ID.');
        }

        return await Account.findOne(query);
        }

    //update acc
    async updateAcc(id: string, data: Partial<IAccount | IInvestorStats>) {
        if (data.type === 'beneficiary') {
            return await RegularAccount.findByIdAndUpdate(id, data, { new: true });
        } else if (data.type === 'benefactor') {
            return await InvestorAccount.findByIdAndUpdate(id, data, { new: true });
        } else {
            throw new Error('Invalid account type');
        }
    };
}

const accServices = new AccountServices

export default accServices
