import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import notificationService from "../services/notificationService";
import transactionService from "../services/transactionServic";
import accServices from "../services/accountServices";
import userServices from "../services/userServices";
import { createPaymentTransaction } from '../utils/paystack';



export const getNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.userId;
  try {
    const notifications = await notificationService.fetchNotification(userId)

    if (notifications.length < 1) {
      res.status(200).json({
        success: true,
        message: 'No notification found'
      })
      return;
    }
    res.status(200).json({ 
      success: true,
      message: 'Notifications fetched successfully', 
      data: notifications 
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getTransactions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.userId;
  try {

    const transactions = await transactionService.fetchTransaction(userId);

    if (transactions.length < 1) {
      res.status(200).json({
        success: true,
        message: 'No recent transaction'
      })
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Transactions fetched successfully',
      data: transactions
    })
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}

export const fundAcc = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { amount } = req.body;
  const userId = req.user!.userId;

  try {
    // fetch the user account
    const user = await accServices.fetchAccount(userId);
    console.log(user);
    
  } catch (error) {
    
  }

}
