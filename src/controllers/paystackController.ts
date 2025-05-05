import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { paystackIPS } from '../utils/paystack';
import debtService from '../services/debtServices';
import { config } from 'dotenv';
import crypto from 'crypto';

config();

const secret = process.env.PAYSTACK_SECRET!;

export const handlePaystackWebhook = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress;

  // Log the headers to check if 'x-paystack-signature' exists
  console.log('Request headers:', req.headers);

  const signature = req.headers['x-paystack-signature'] || req.headers['X-Paystack-Signature'];  // Case-insensitive check

  if (!signature) {
    return res.status(400).json({ message: 'Missing Paystack signature in the request headers' });
  }

  const hash = crypto.createHmac('sha512', secret)
    .update(JSON.stringify(req.body))  // Ensure req.body is converted to string
    .digest('hex');

  console.log('Computed hash:', hash);
  console.log('Paystack signature:', signature);

  if (hash !== signature) {
    return res.status(401).json({ message: 'Unauthorized: Invalid signature' });
  }

  const event = req.body;  // req.body is already parsed (no need to JSON.parse)

  console.log("Webhook received:", event.event);

  if (event.event === 'charge.success') {
    const metadata = event.data.metadata;
    const debtId = metadata?.debtId;
    const amountPaid = event.data.amount / 100;

    const debt = await debtService.fetchDebt(debtId);

    if (debt && debt.amount <= amountPaid) {
      await debtService.updateDebt(debtId, { isCleared: true });
    }
    console.log(res);
    
    return res.status(200).send('OK');
  }

  res.status(200).send('Unhandled event');
};
