"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const accountModel_1 = require("../models/accountModel");
class AccountServices {
    async createAccount(data) {
        if (data.type === 'beneficiary') {
            return await accountModel_1.RegularAccount.create(data);
        }
        else if (data.type === 'benefactor') {
            return await accountModel_1.InvestorAccount.create(data);
        }
        else {
            throw new Error('Invalid account type');
        }
    }
    ;
    async fetchAccount(id) {
        return await accountModel_1.Account.findById(id);
    }
    //update acc
    async updateAcc(id, data) {
        if (data.type === 'beneficiary') {
            return await accountModel_1.RegularAccount.findByIdAndUpdate(id, data, { new: true });
        }
        else if (data.type === 'benefactor') {
            return await accountModel_1.InvestorAccount.findByIdAndUpdate(id, data, { new: true });
        }
        else {
            throw new Error('Invalid account type');
        }
    }
    ;
}
const accServices = new AccountServices;
exports.default = accServices;
