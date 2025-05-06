import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import debtService from '../services/debtServices';
import accServices from '../services/accountServices';
import { config } from 'dotenv';
import crypto from 'crypto';


config();

const secret = process.env.PAYSTACK_SECRET!;

export const handlePaystackWebhook = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress;

  // Log the headers to check if 'x-paystack-signature' exists
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

    console.log('Computed hash:', hash);
    console.log('Paystack signature:', signature);

    if (hash !== signature) {
        res.status(401).json({ 
            success: false,
            message: 'Unauthorized: Invalid signature' 
          });
          return;
        }

    const event = req.body; 

    console.log("Webhook received:", event.event);
    console.log('webhook req', event);
    

    if (event.event === 'charge.success') {
        const metadata = event.data.metadata;
        const debtId = metadata?.debtId;
        const amountPaid = event.data.amount / 100;

        const debt = await debtService.fetchDebt(debtId);

        const acc = await accServices.fetchAccount(debt!.user);
        console.log('coins', acc!.coins, debt!.incentives);
        
        const balCoins = acc!.coins - debt!.incentives;
        console.log(balCoins);
        

        if (debt && debt.amount <= amountPaid) {
          await debtService.updateDebt(debtId, { isCleared: true });
          const updatedAcc = await accServices.updateAcc(acc!._id, { coins: balCoins})
          console.log(' Transfer successful:', updatedAcc);
        }

        
        res.status(200).send('ok');
        return;
      }
       
  } catch (error: any) {
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
    })
  }
};
