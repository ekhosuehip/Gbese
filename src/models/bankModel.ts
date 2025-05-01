import { Schema, model } from 'mongoose';
import { IBank } from "../interfaces/banks";

const bankSchema = new Schema<IBank> ({
    name: {type: String, required: true, unique: true, trim: true},
    code: {type: String, required: true, unique: true, trim: true},
    },
    {timestamps: false, versionKey: false, collection: 'bank'}
)

const Bank = model<IBank>('Bank', bankSchema);

export default Bank
