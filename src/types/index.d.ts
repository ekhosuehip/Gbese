import { DecodedUser } from '../interfaces/user'

declare global {
  namespace Express {
    interface Request {
      user?: DecodedUser;
    }
  }
}

export {}; 
å