import { Schema, model, Types } from 'mongoose';
import { ITransaction } from '../interfaces/activities';

const TransactionSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User', required: true },
  debtId: { type: Types.ObjectId, ref: 'Debt' }, 
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  fundType: { type: String, required: true },
  recipient: { type: String },
}, {
  timestamps: true, versionKey: false
});


const Transaction = model<ITransaction>('Transaction', TransactionSchema);
export default Transaction;
