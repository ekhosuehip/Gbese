import axios from 'axios';

export const paystackIPS = [
  '52.31.139.75',
  '52.49.173.169',
  '52.214.14.220'
];

export const createPaymentTransaction = async ({
  email,
  amount,
  metadata
}: {
  email: string;
  amount: number;
  metadata?: Record<string, any>;
}) => {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET;

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
