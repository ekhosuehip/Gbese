// models/Notification.ts
import { Schema, Types, model } from 'mongoose';
import { INotification } from '../interfaces/activities';

const NotificationSchema: Schema = new Schema({
  user: { type: Types.ObjectId, ref: 'User', required: true },
  title: {type: String},
  message: {type: String},
  type: { type: String, enum: ['debt_transfer', 'debt_status', 'payment', 'fund_account'], required: true },
  createdAt: { type: Date, default: Date.now }
});

const Notification = model<INotification>('Notification', NotificationSchema);


export default Notification
