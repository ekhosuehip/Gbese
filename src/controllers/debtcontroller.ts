import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { IDebt } from '../interfaces/debts'
import { customAlphabet } from 'nanoid';
import debtService from "../services/debtServices";


export const createDebt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
   const {description, amount, dueDate, status} = req.body
   
    const userId = req.user!.userId;
    if (!userId) {
        res.status(400).json({
            success: false,
            message: 'User not authenticated'
        })
        return;
    }
    try {
        //Generate random ID 
        const generateCustomId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);
        const debtId = generateCustomId();

        const newDebt: IDebt = {
            debtId: debtId,
            description: description,
            amount: amount,
            dueDate: dueDate,
            status: status
        };

        const createdDebt = await debtService.createDebt(newDebt);

        res.status(200).json({
            success: true,
            message: 'Debt create successfully',
            data: createdDebt
        })
    } catch (error) {
        
    }
    
}