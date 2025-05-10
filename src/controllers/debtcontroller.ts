import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { IDebt } from '../interfaces/debts';
import notificationService from '../services/notificationService';
import transactionService from "../services/transactionServic";
import userServices from "../services/userServices";
import statsService from "../services/statsServices";
import { createPaymentTransaction } from '../utils/paystack'
import debtService from "../services/debtServices";
import { resolveBank } from '../utils/bank';
import { s3Upload } from '../utils/s3Service';
import { Types } from "mongoose";


export const createDebt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
   const {bankCode, debtSource, accountNumber, description, amount, dueDate, interestRate, incentives} = req.body
   const statementFile = req.file;
   
    const userEmail = req.user!.email;
    
    if (!statementFile) {
        res.status(400).json({
            success: false,
            message: 'Statement file is required',
        });
        return;
    }
    try {

        const user = await userServices.fetchUser(userEmail);

        if (!user) {
            res.status(400).json({
                success: false,
                message: 'login again token expired'
            })
            return;
        }

        const imageUrl = await s3Upload(statementFile);
        console.log(imageUrl);
        
        //Verify account data
        const accData = await resolveBank(accountNumber, bankCode)
        console.log(accData);

        if (!accData || accData.status !== true) {
        res.status(400).json({
            success: false,
            message: 'Account not found',
        });
        return;
        }

        //Check the status of the debt
        const now = new Date();
        const statusDate = new Date(dueDate);

        const isOverdue =
        statusDate.getFullYear() < now.getFullYear() ||
        (statusDate.getFullYear() === now.getFullYear() &&
        statusDate.getMonth() < now.getMonth());

        const statusLabel = isOverdue ? 'overdue' : 'coming up';

        const newDebt = {
            user: user!._id,
            note: description,
            statement: imageUrl,
            interestRate: interestRate ? interestRate : 0,
            incentives: incentives,
            accountNumber: accountNumber,
            bankCode: bankCode,
            bankName: `Debt from ${debtSource}`,
            accountName: accData.data.account_name,
            amount: amount,
            dueDate: dueDate,
            status: statusLabel
        };

        const createdDebt = await debtService.createDebt(newDebt);

        res.status(200).json({
            success: true,
            message: 'Debt create successfully',
            data: createdDebt
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
        return;
    }
    
}

export const transferMethod = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { debtId } = req.params;
    const { transferMethod, receiverId } = req.body;

    console.log(transferMethod);
    

    try {
        // fetch dabt
        const debt = await debtService.fetchDebt(debtId);
        
        if (!debt) {
            res.status(400).json({
                success: false,
                message: `No debt matching ID ${debtId} found`
            });
            return;
        }

        // Apply transfer method updates
        const updateData: Partial<IDebt> = {
            transferMethod: transferMethod,
            isTransferred: true
        };

        let recipient;

        if (transferMethod === 'marketplace') {
            updateData.isListed = true;
            recipient = 'marketpalce'
        }else if ( transferMethod === 'specific') {
            updateData.transferTarget = receiverId;
            const receiver = await userServices.fetchUserById(receiverId)
            recipient = receiver?.fullName

            //updating benefactor stats
            const receiverStats = await statsService.fetchStat(receiverId)
            if (receiverStats) {
            receiverStats.debtTransfers += 1;
            await receiverStats.save(); 
        }

            await notificationService.createNotification({
                userId: receiverId,
                title: 'New Debt Transferred to You',
                message: `A debt has been transferred to you for ₦${debt.amount}`,
                type: 'debt_transfer',
            });
        }else {
            recipient = 'Shared link'
        }

        
        
        const paymentTransaction = await createPaymentTransaction({
            email: req.user!.email,
            amount: debt.amount,
            metadata: {
                type: "debt_payment",
                debtId: debtId
            }
        });

        updateData.paymentLink = paymentTransaction.authorization_url;
        console.log('now');

        const updatedDebt = await debtService.updateDebt(debtId, updateData);

        console.log(updatedDebt);

        const userID = new Types.ObjectId(req.user!.userId);
        const debtID = new Types.ObjectId(debtId);

        const data = {
            user: userID,
            debtId: debtID,
            type:  'Transfer_debt',
            amount: debt.amount,
            status: 'Pending',
            fundType: 'debit',
            recipient: recipient,
        }

        //updating beneficiary stats
        const userStats = await statsService.fetchStat(req.user!.userId);
        if (userStats) {
            userStats.debtTransfers += 1;
            await userStats.save(); 
        }

        await transactionService.createTransaction(data)
        // await statsService.updateStats(userID, {t})
        
        res.status(200).json({
            success: true,
            message: "Debt transfer method updated",
            data: updatedDebt
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
        return;
    }
};

export const listedDebt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const allDebts = await debtService.fetchListedDebt();
        res.status(200).json({
            success: true,
            message: 'Debts fetched successfully',
            data: allDebts
        })
        return;
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
        return;
    }
}

export const acceptDebt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { debtId } = req.params;
    const userId = req.user!.userId;

    try {
        const debt = await debtService.fetchDebt(debtId);

        if (!debt ||  debt.transferStatus !== 'pending') {
            res.status(403).json({ 
                success: false, 
                message: "Debt already paid " 
            });
            return;
        }

        debt.acceptedBy = new Types.ObjectId(userId);
        debt.transferStatus = 'accepted';
        await debt.save();

        await notificationService.createNotification({
            userId: debt.user.toString(),
            title: 'Your Debt Was Accepted',
            message: `Your debt of ₦${debt.amount} was accepted by a benefactor.`,
            type: 'debt_status'
        });

        await transactionService.fetchUpdateTransaction(debtId, { status: 'Accepted'})

        const userStats = await statsService.fetchStat(req.user!.userId);
        if (userStats) {
            userStats.helped += 1;

            userStats.successRate = userStats.debtTransfers > 0
                ? ( userStats.debtTransfers / userStats.helped ) * 100 : 0;

            await userStats.save();
        }

        res.status(200).json({ 
            success: true, 
            message: "Debt accepted", 
            data: debt 
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        })
    }
};

export const rejectDebt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { debtId } = req.params;
    const userId = req.user!.userId;

    try {
        const debt = await debtService.fetchDebt(debtId);

        if (!debt || debt.transferTarget?.toString() !== userId || debt.transferStatus !== 'pending') {
            res.status(403).json({
                success: false,
                message: "Not authorized to reject this debt"
            });
            return;
        }

        // Mark debt as declined
        debt.transferStatus = 'declined';
        await debt.save();

        // Notify the original user
        await notificationService.createNotification({
            userId: debt.user.toString(),
            title: 'Debt Rejected',
            message: `Your debt of ₦${debt.amount} was rejected by the intended benefactor.`,
            type: 'debt_status'
        });

        await transactionService.fetchUpdateTransaction(debtId, { status: 'Failed'})

        res.status(200).json({
            success: true,
            message: "Debt rejected",
            data: debt
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};


