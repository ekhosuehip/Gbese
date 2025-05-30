import { Types } from 'mongoose';

export interface ITransaction {
  user: Types.ObjectId;
  debtId?: Types.ObjectId;
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


export interface IStats {
  user: Types.ObjectId,
  debtTransfers: number,
  helped: number,
  successRate: number,
  responseTime: number,
  repeatCase: number
}

export interface IRequest {
  user: Types.ObjectId,
  receiver: Types.ObjectId,
  dueDate: string,
  amount: number,
  description: string,
  refrence: string,
  status: 'pending' | 'accepted' | 'declined',
  transactionId: Types.ObjectId
}