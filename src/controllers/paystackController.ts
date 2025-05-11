import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import debtService from '../services/debtServices';
import accServices from '../services/accountServices';
import transactionService from '../services/transactionServic';
import { config } from 'dotenv';
import crypto from 'crypto';
import notificationService from '../services/notificationService';
import { ITransaction } from '../interfaces/activities';


config();

const secret = process.env.PAYSTACK_SECRET!;

export const handlePaystackWebhook = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('Request headers:', req.headers); 

  try {
    const signature = req.headers['x-paystack-signature'] || req.headers['X-Paystack-Signature'];

    if (!signature) {
      res.status(400).json({ 
        success: false,
        message: 'Missing Paystack signature in the request headers'
      });
      return;
    }

    const hash = crypto.createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== signature) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized: Invalid signature' 
      });
    }

    const event = req.body;
    const metadata = event.data.metadata;
    const amountPaid = event.data.amount / 100;

    if (event.event === 'charge.success') {
      switch (metadata.type) {
        case 'debt_payment': {
          const debtId = metadata.debtId;
          const debt = await debtService.fetchDebt(debtId);
          const accId = debt!.user.toString();
          const acc = await accServices.fetchAccount(accId);
          const balCoins = acc!.coins - debt!.incentives;

          if (debt && debt.amount <= amountPaid) {
            await debtService.updateDebt(debtId, { isCleared: true });
            await accServices.updateAcc(accId, { type: acc!.type, coins: balCoins });
            await transactionService.fetchUpdateTransaction(debtId, { status: 'Complete' });
          }

          await notificationService.createNotification({
            userId: accId,
            title: 'Your Debt Was Paid',
            message: `Your debt of ₦${debt!.amount} was successfully paid.`,
            type: 'payment'
          });

          break;
        }

        case 'fund_account': {
          const accId = metadata.accId;
          const userAcc = await accServices.fetchAccount(accId);

          const newCoins = userAcc!.coins + 2;
          const newBal = userAcc!.balance + amountPaid
          await accServices.updateAcc(accId, { type: userAcc!.type, balance: newBal, coins: newCoins });

          const transactionData : ITransaction = {
            user: accId,
            type: 'CREDIT',
            amount: amountPaid,
            status: 'complete',
            fundType: 'Bank'
          }

          await transactionService.createTransaction(transactionData);

          await notificationService.createNotification({
              userId: accId,
              title: 'Account funded.',
              message: `Your account was funded with ₦${amountPaid}.`,
              type: 'fund_account'
            });

          break;
        }

        default:
          console.warn('Unhandled metadata type:', metadata.type);
      }

      res.status(200).send('ok');
      return;
    }

    res.status(200).send('ignored');
    return;

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
    return;
  }
};
