import { Types, Document } from 'mongoose';

export interface IDebt extends Document {
  user: Types.ObjectId,
  accountNumber: string,
  accountName: string,
  bankName: string,
  note?: string,
  amount: number,
  bankCode: string,
  statement?: string,
  interestRate: number,
  incentives: number,
  dueDate: string,
  status: string,
  isListed?: boolean,
  isCleared: boolean,
  transferMethod?: 'marketplace' | 'direct' | 'link',
  isTransferred?: boolean,
  transferTarget?: Types.ObjectId,
  transferStatus?: 'pending' | 'accepted' | 'declined',
  acceptedBy?: Types.ObjectId,
  paymentLink?: string
}
