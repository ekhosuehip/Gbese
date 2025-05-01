import { Types } from 'mongoose';

export interface IDebt {
  debtId: string;
  user: Types.ObjectId;
  accountNumber: string;
  accountName: string;
  amount: number;
  note?: string;
  bankName: string;
  interestRate?: number;
  statement: string;
  dueDate: string;
  incentives: number;
  status: string;
}