import axios from 'axios';
import dotenv from 'dotenv';
import { IBankResponse } from '../interfaces/banks';

dotenv.config();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

export const resolveBank = async (accNumber: string, bankCode: string): Promise<IBankResponse | void> => {
  try {
    const response = await axios.get('https://api.paystack.co/bank/resolve', {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`
      },
      params: {
        account_number: accNumber,
        bank_code: bankCode
      }
    });

    console.log(response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error resolving account:', error.response?.data || error.message);
    throw new Error('Bank resolution failed');
  }
};
