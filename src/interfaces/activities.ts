import { Types } from 'mongoose';

export interface ITransaction {
  user: Types.ObjectId;
  debtId: Types.ObjectId;
  type: string;
  amount: number;
  status: string;
  fundType: string;
  recipient?: string
}

export interface INotification {
  user: Types.ObjectId;
  title: string;
  message: string;
  type: 'debt_transfer' | 'debt_status' | 'payment' | 'fund_account';
}

