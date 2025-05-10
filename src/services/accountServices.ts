import { Account, RegularAccount, InvestorAccount } from '../models/accountModel';
import { IAccount, IInvestorStats } from '../interfaces/banks';

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

    async fetchAccount (id: string) {
        return await Account.findById(id)
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
