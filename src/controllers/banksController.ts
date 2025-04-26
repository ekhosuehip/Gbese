import { Request, Response, NextFunction} from 'express';
import banksServices from '../services/bankService';



//Fetch all banks 
export const fetchAllBanks = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const banks = await banksServices.fetchAllBanks()
        res.status(200).json({
            success: true,
            message: 'Banks fetched successfully',
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
        res.status(400).json({
            success: false,
            message: 'Bank name needed as quary params'
        })
        return;
    }

    try {
        const bankName = name.toUpperCase();
        const bank = await banksServices.fetchBank(bankName);
        if (!bank){
            res.status(400).json({
                success: false,
                message: ' Invalid bank name'
            })
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Bank fetched successfully',
            data: bank
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