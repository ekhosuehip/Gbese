import { JwtPayload } from "jsonwebtoken";


export interface IUser {
  phoneNumber: string,
  fullName: string,
  email: string,
  password: string,
  dateOfBirth: string,
  gender: string,
  bvn?: string,
  isKycComplete?: Boolean,
  type: 'beneficiary' | 'benefactor',
}

export interface IAuthPayload {
  fullName: string,
  email: string
}


export interface DecodedUser extends JwtPayload {
  userId: string,
  email: string
}
