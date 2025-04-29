import { Types } from "mongoose";
export interface IBank {
    code: string,
    name: string
}

export interface IAccount {
    _id: Types.ObjectId,
    accNumber: string,
    balance: number,
    creditLimit: number
}