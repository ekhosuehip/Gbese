"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestorAccount = exports.RegularAccount = exports.Account = void 0;
const mongoose_1 = require("mongoose");
const options = {
    discriminatorKey: 'type',
    timestamps: true,
    versionKey: false
};
const baseAccountSchema = new mongoose_1.Schema({
    _id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: ['beneficiary', 'benefactor'] }
}, options);
// Create base model
const Account = (0, mongoose_1.model)('Account', baseAccountSchema);
exports.Account = Account;
// Regular Account schema
const regularAccountSchema = new mongoose_1.Schema({
    coins: { type: Number },
    accNumber: { type: String },
    balance: { type: Number, required: true, default: 0.0 },
    creditLimit: { type: Number, required: true, default: 50000.00 }
});
// Investor schema
const investorSchema = new mongoose_1.Schema({
    coins: { type: Number },
    accNumber: { type: String },
    balance: { type: Number, required: true, default: 0.0 },
    amountInvested: { type: Number, required: true, default: 0 },
    helped: { type: Number, required: true, default: 0 },
    RIO: { type: Number, required: true, default: 0 }
});
// Create discriminators
const RegularAccount = Account.discriminator('beneficiary', regularAccountSchema);
exports.RegularAccount = RegularAccount;
const InvestorAccount = Account.discriminator('benefactor', investorSchema);
exports.InvestorAccount = InvestorAccount;
