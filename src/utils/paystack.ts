import axios from 'axios';
import { config } from 'dotenv';
import dotenv from 'dotenv';
import { IBankResponse } from '../interfaces/banks';

config()

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET;

export const resolveBank = async (accNumber: string, bankCode: string): Promise<IBankResponse | void> => {
  try {
    const response = await axios.get('https://api.paystack.co/bank/resolve', {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
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
    return error.response
    throw new Error('Bank resolution failed');
  }
};


export const createPaymentTransaction = async ({
  email,
  amount,
  metadata
}: {
  email: string;
  amount: number;
  metadata?: Record<string, any>;
}) => {

  const response = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    {
      email,
      amount: amount * 100, // Paystack expects amount in kobo
      metadata,
    },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.data; 
};


