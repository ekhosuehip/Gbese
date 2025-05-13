import { IRequest } from '../interfaces/activities';
import { Types, Schema, model } from 'mongoose';

const requestSchema = new Schema ({
    user: {type: Types.ObjectId, required: true, ref: "User"},
    receiver: {type: Types.ObjectId, required: true, ref:"User"},
    transactionId: {type: Types.ObjectId, required: true, ref:"Transaction"},
    dueDate: {type: String},
    amount: {type: String},
    description: {type: String},
    refrence: {type: String},
    status: {type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }
}, {timestamps: true, versionKey: false})

const Requests = model<IRequest>("Requests", requestSchema);

export default Requests