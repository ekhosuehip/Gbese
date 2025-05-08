import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import notificationService from "../services/notificationService";
import transactionService from "../services/transactionServic";


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
