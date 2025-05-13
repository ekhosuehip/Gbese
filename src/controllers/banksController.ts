import { Request, Response, NextFunction} from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import banksServices from '../services/bankService';
import { resolveBank } from '../utils/paystack'



//Fetch all banks 
export const fetchAllBanks = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const banks = await banksServices.fetchAllBanks()
        console.log(banks);
        
        res.status(200).json({
            success: true,
            message: banks.length > 0 ? 'Banks fetched successfully' : 'No banks found',
            data: banks
        });
        return;
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error 
        });
        return;
    }
}

// Fetch specific bank
export const fetchBank = async (req: Request, res: Response, next: NextFunction) => {
    
    const name = req.query.bank as string;
    
    if(!name){
        return res.status(400).json({
            success: false,
            message: 'Bank name needed as quary params'
        })
    }

    try {
        const bankName = name.toUpperCase();
        const bank = await banksServices.fetchBank(bankName);
        if (!bank){
            return res.status(400).json({
                success: false,
                message: ' Invalid bank name'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Bank fetched successfully',
            data: bank
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error 
        });
    }
}

export const resolveBankDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const {accNumber, bankCode} = req.body;

    try {
        const accData = await resolveBank(accNumber, bankCode);
        //Verify account data
        
        if (!accData || accData.status !== true) {
            return res.status(400).json({
                success: false,
                message: 'Account not found',
            });
            }
        const name = accData.data.account_name;
        return res.status(200).json({
            success: true,
            message: 'Account resolved successfully',
            data: {
                accName: name,
                accNumber: accNumber
            }
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}