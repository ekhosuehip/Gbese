import { Schema, Types, model} from 'mongoose';
import { IStats } from '../interfaces/activities';

const statsSchema = new Schema({
    user: {type: Types.ObjectId, ref: 'User'},
    account: {type: Types.ObjectId, ref: 'Account'},
    debtTransfers: {type: Number, default: 0},
    helped: {type: Number, default: 0},
    successRate: {type: Number, default: 0},
    responseTime: {type: Number, default: 0},
    repeatCase: {type: Number, default: 0}
}, {timestamps: true, versionKey: false});

const Stats = model<IStats>('Stats', statsSchema);
export default Stats