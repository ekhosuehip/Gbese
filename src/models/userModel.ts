import { Schema, model } from 'mongoose';
import { IUser } from '../interfaces/user';

const userSchema = new Schema<IUser>({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, trim: true },
  phoneNumber: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  dateOfBirth: { type: String, required: true },
  gender: { type: String, required: true, trim: true },
  type: { type: String, required: true },
  bvn: { type: String, unique: true, sparse: true, trim: true },
  isKycComplete: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

const User = model<IUser>('User', userSchema);
export default User;
