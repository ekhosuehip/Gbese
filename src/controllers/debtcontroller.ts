import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { IDebt } from '../interfaces/debts'
import banksServices from "../services/bankService";
import userServices from "../services/userServices";
import { createPaymentTransaction } from '../utils/paystack'
import debtService from "../services/debtServices";
import { resolveBank } from '../utils/bank';
import { s3Upload } from '../utils/s3Service';


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
    const { transferMethod } = req.body;

    console.log(transferMethod);
    

    try {
        const debt = await debtService.fetchDebt(debtId);
        console.log('here');
        
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

        transferMethod === 'marketplace' && (updateData.isListed = true);
        console.log('there');
        
        const paymentTransaction = await createPaymentTransaction({
            email: req.user!.email,
            amount: debt.amount,
            metadata: {
            debtId: debtId,
            userId: req.user!.userId,
            },
        });

        updateData.paymentLink = paymentTransaction.authorization_url;
        console.log('now');

        const updatedDebt = await debtService.updateDebt(debtId, updateData);

        console.log(updatedDebt);
        

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
