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


export const createTransferRecipient = async (accountName: string, accountNumber: string, bankCode: string) => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/transferrecipient',
      {
        type: 'nuban',
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN'
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.data.recipient_code;
  } catch (error: any) {
    console.error('Error creating transfer recipient:', error.response?.data || error.message);
    throw new Error('Failed to create transfer recipient');
  }
};


export const initiateTransfer = async (amount: number, recipientCode: string, reason = 'Debt settlement') => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/transfer',
      {
        source: 'balance',
        amount: amount * 100, // Convert naira to kobo
        recipient: recipientCode,
        reason
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('❌ Error initiating transfer:', error.response?.data || error.message);
    throw new Error('Failed to initiate transfer');
  }
};

