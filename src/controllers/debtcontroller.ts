import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { IDebt } from '../interfaces/debts'
import banksServices from "../services/bankService";
import userServices from "../services/userServices";
import { customAlphabet } from 'nanoid';
import debtService from "../services/debtServices";
import { resolveBank } from '../utils/bank';
import { s3Upload } from '../utils/s3Service';


export const createDebt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
   const {bankCode, bankName, accountNumber, description, amount, dueDate, interestRate, incentives} = req.body
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
        
        //Generate random ID 
        const generateCustomId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);
        const debtId = generateCustomId();

        //Check the status of the debt
        const now = new Date();
        const statusDate = new Date(dueDate);

        const isOverdue =
        statusDate.getFullYear() < now.getFullYear() ||
        (statusDate.getFullYear() === now.getFullYear() &&
        statusDate.getMonth() < now.getMonth());

        const statusLabel = isOverdue ? 'overdue' : 'coming up';

        const newDebt: IDebt = {
            debtId: debtId,
            user: user!._id,
            note: description,
            statement: imageUrl,
            interestRate: interestRate ? interestRate : 0,
            incentives: incentives,
            accountNumber: accountNumber,
            bankName: `Debt from ${bankName}`,
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
    }
    
}