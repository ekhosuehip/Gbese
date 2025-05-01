import { Schema, model } from 'mongoose';
import { IAccount } from "../interfaces/banks";

const accountSchema = new Schema<IAccount>({
    _id: {type: Schema.Types.ObjectId, required: true, ref: "User"},
    coins: {type: Number},
    accNumber: {type: String, required: true},
    balance: { type: Number, required: true, default: 0.00 },
    creditLimit: { type: Number, required: true, default: 50000 }
}, 
{ timestamps: true, versionKey: false}
);

const Account = model<IAccount>('Account', accountSchema);
export default Account;
