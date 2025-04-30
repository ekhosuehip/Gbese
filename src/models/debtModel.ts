import { IDebt } from '../interfaces/debts';
import { Schema, model } from "mongoose";


const debtSchema = new Schema({
    _id: {type: Schema.Types.ObjectId, required: true, ref: "User"},
    debtId: {type: String, required: true},
    description: {type: String, required: true, trim: true},
    amount: {type: Number, required: true},
    dueDate: {type: String, required: true, trim: true},
    status: {type: String, required: true, default: "Pending"}
    },
    {timestamps: true, versionKey: false});

const Debt = model<IDebt>("Debt", debtSchema);

export default Debt;