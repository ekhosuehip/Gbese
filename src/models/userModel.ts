import { Schema, model } from 'mongoose';
import { IUser, UserRole } from '../interfaces/user';

const userSchema = new Schema<IUser>({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, trim: true },
  phoneNumber: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  DOB: { type: Date, required: true },
  role: { 
    type: String, 
    enum: Object.values(UserRole), 
    required: true,
  },
}, { timestamps: true, versionKey: false });

const User = model<IUser>('User', userSchema);

export default User;
