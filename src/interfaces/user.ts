import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";


export interface IUser {
  phoneNumber: string,
  fullName: string,
  email: string,
  password: string,
  dateOfBirth: string,
  gender: string,
  bvn?: string,
  isKycComplete?: Boolean,
  isBeneficiator?: Boolean,
  type: 'beneficiary' | 'benefactor',
}

export interface IAuthPayload {
  userId: Types.ObjectId,
  fullName: string,
  email: string
}


export interface DecodedUser extends JwtPayload {
  userId: string,
  email: string
}
