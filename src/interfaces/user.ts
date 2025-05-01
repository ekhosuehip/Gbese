import { JwtPayload } from "jsonwebtoken";

export enum UserRole {
  Beneficiary = 'beneficiary',
  Benefactor = 'benefactor',
}

export interface IUser {
  phoneNumber: string,
  fullName: string,
  email: string,
  password: string,
  dateOfBirth: string,
  gender: string,
  bvn?: string,
  isKycComplete?: Boolean,
  role: UserRole,
}

export interface IAuthPayload {
  fullName: string,
  email: string
}


export interface DecodedUser extends JwtPayload {
  userId: string,
  email: string
}
