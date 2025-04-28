import { JwtPayload } from "jsonwebtoken";

export enum UserRole {
  Philanthropists = 'philanthropists',
  Regular = 'regular',
}

export interface IUser {
  accNumber: string,
  phoneNumber: string,
  fullName: string,
  email: string,
  password: string,
  dateOfBirth: string,
  gender: string,
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
