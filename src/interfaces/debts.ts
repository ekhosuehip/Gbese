import { Types } from "mongoose";

export interface IDebt {
    debtId: string,
    description: string,
    amount: number,
    dueDate: string,
    status: string
}