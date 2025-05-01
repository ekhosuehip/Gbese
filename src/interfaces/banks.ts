import { Types } from "mongoose";
export interface IBank {
    code: string,
    name: string
}

export interface IAccount {
    _id: Types.ObjectId,
    coins: number,
    accNumber: string,
    balance: number,
    creditLimit: number
}

export interface IBankResponse {
  status: boolean;
  message: string;
  data: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
}
