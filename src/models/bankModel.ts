import { Schema, model } from 'mongoose';
import { IBank } from "../interfaces/banks";

const bankSchema = new Schema<IBank> ({
    name: {type: String, required: true, unique: true, trim: true},
    code: {type: String, required: true, unique: true, trim: true},
    },
    {timestamps: true, versionKey: false}
)

const Banks = model<IBank>('Banks', bankSchema);
export default Banks
