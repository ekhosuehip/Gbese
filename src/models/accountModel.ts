import { Schema, model } from 'mongoose';
import { IAccount, IInvestorStats } from '../interfaces/banks';

const options = {
  discriminatorKey: 'type',
  timestamps: true,
  versionKey: false
};

const baseAccountSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: ['regular', 'investor'] }
  },
  options
);

// Create base model
const Account = model<IAccount | IInvestorStats>('Account', baseAccountSchema);

// Regular Account schema
const regularAccountSchema = new Schema({
  coins: { type: Number },
  accNumber: { type: String },
  balance: { type: Number, required: true, default: 0.0 },
  creditLimit: { type: Number, required: true, default: 50000 }
});

// Investor schema
const investorSchema = new Schema({
  amountInvested: { type: Number, required: true, default: 0 },
  helped: { type: Number, required: true, default: 0 },
  RIO: { type: Number, required: true, default: 0 }
});

// Create discriminators
const RegularAccount = Account.discriminator<IAccount>('regular', regularAccountSchema);
const InvestorAccount = Account.discriminator<IInvestorStats>('investor', investorSchema);

export { Account, RegularAccount, InvestorAccount };
