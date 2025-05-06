import axios from 'axios';
import { config } from 'dotenv';

config()

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET;

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


