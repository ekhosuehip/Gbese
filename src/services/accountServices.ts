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

    async fetchAccount (id: object) {
        return await Account.findById(id)
    }
}

const accServices = new AccountServices

export default accServices
