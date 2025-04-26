export enum UserRole {
  Philanthropists = 'Philanthropists',
  Regular = 'Regular',
}

export interface IUser {
  phoneNumber: string;
  fullName: string;
  email: string;
  password: string;
  DOB: Date;
  role: UserRole;
}

export interface IAuthPayload {
  name: string,
  email: string
}
