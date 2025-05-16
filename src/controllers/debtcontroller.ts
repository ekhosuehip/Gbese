import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { IDebt } from '../interfaces/debts';
import notificationService from '../services/notificationService';
import transactionService from "../services/transactionServic";
import userServices from "../services/userServices";
import statsService from "../services/statsServices";
import { createPaymentTransaction } from '../utils/paystack'
import debtService from "../services/debtServices";
import { resolveBank } from '../utils/paystack';
import { s3Upload } from '../utils/s3Service';
import { Types } from "mongoose";
import accServices from "../services/accountServices";
import nodemailer from 'nodemailer';


export const createDebt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
   const {bankCode, debtSource, accountNumber, description, amount, dueDate, interestRate, incentives, transferMethod, receiverId} = req.body
   const statementFile = req.file;
   
    const userId= req.user!.userId;
    
    if (!statementFile) {
        return res.status(400).json({
            success: false,
            message: 'Statement file is required',
        });
    }
    try {

         //Verify account data
        const accData = await resolveBank(accountNumber, bankCode);

        if (!accData || accData.status !== true) {
        return res.status(400).json({
            success: false,
            message: 'Account not found',
        });
        }

        const user = await userServices.fetchUserById(userId);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'login again token expired'
            })
        }

        const imageUrl = await s3Upload(statementFile);

        //Check the status of the debt
        const now = new Date();
        const statusDate = new Date(dueDate);

        const isOverdue =
        statusDate.getFullYear() < now.getFullYear() ||
        (statusDate.getFullYear() === now.getFullYear() &&
        statusDate.getMonth() < now.getMonth());

        const statusLabel = isOverdue ? 'overdue' : 'coming up';

        let paymentLink
        let transferTarget;
        let recipient;
        let paymentTransaction;
        if (transferMethod === 'specific') {
            transferTarget = receiverId;
            const receiver = await userServices.fetchUserById(receiverId)
            recipient = receiver?.fullName

            //updating benefactor stats
            const receiverStats = await statsService.fetchStat(receiverId)
            if (receiverStats) {
            receiverStats.debtTransfers += 1;
            await receiverStats.save(); }

            await notificationService.createNotification({
                userId: receiverId,
                title: 'New Debt Transferred to You',
                message: `A debt of ₦${amount} has been transferred to you by ${user?.fullName}  `,
                type: 'debt_transfer',
            });
        } else if (transferMethod === 'sharedLink') {
            recipient = 'SharedLink',
            paymentTransaction = await createPaymentTransaction({
                email: req.user!.email,
                amount: amount,
                metadata: {
                    type: "debt_payment",
                }
            });

            console.log("paymentTransaction:", paymentTransaction);

            if (!paymentTransaction || !paymentTransaction.authorization_url) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create payment link',
                });
            }

            paymentLink = paymentTransaction.authorization_url;
        } else {
            recipient = 'marketplace'
        }

        const isListed = recipient === "marketplace" ? true : false;


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
            status: statusLabel,
            transferMethod: transferMethod,
            recipient: recipient,
            paymentLink: paymentLink,
            isListed: isListed,
            transferTarget: transferTarget,
            isTransferred: true
        };

        const createdDebt = await debtService.createDebt(newDebt);

        return res.status(200).json({
            success: true,
            message: 'Debt create successfully',
            data: createdDebt
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
    
}

export const transferMethod = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { debtId } = req.params;
    const { transferMethod, receiverId } = req.body;
    
    const userId = req.user!.userId

    console.log(transferMethod, receiverId);
    console.log(debtId);

     if (!transferMethod || !debtId) {
            return res.status(400).json({
                success: false,
                message: 'transferMethod and debtId is required'
            });
            }
    

    try {
        // fetch dabt
        const debt = await debtService.fetchDebt(debtId);

        const user = await userServices.fetchUserById(userId);
        
        if (!debt) {
            return res.status(400).json({
                success: false,
                message: `No debt matching ID ${debtId} found`
            });
        }

        // Apply transfer method updates
        const updateData: Partial<IDebt> = {
            transferMethod: transferMethod,
            isTransferred: true
        };

        let recipient;
        let paymentTransaction;
        if (transferMethod.toLowerCase() === 'specific') {
            updateData.transferTarget = receiverId;
            const receiver = await userServices.fetchUserById(receiverId)
            recipient = receiver?.fullName

            //updating benefactor stats
            const receiverStats = await statsService.fetchStat(receiverId)
            if (receiverStats) {
            receiverStats.debtTransfers += 1;
            await receiverStats.save(); }

            await notificationService.createNotification({
                userId: receiverId,
                title: 'New Debt Transferred to You',
                message: `A debt of ₦${debt.amount} has been transferred to you by ${user?.fullName}  `,
                type: 'debt_transfer',
            });
            
        } else if (transferMethod.toLowerCase() === 'sharedLink') {
            recipient = 'Shared link',
            paymentTransaction = await createPaymentTransaction({
                email: req.user!.email,
                amount: debt.amount,
                metadata: {
                    type: "debt_payment",
                    debtId: debtId
                }
            });

            console.log("paymentTransaction:", paymentTransaction);

            if (!paymentTransaction || !paymentTransaction.authorization_url) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create payment link',
                });
            }

            updateData.paymentLink = paymentTransaction.authorization_url;
        } else {
            updateData.isListed = true;
            recipient = 'marketpalce'
        }

        

        
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

        //update beneficiary stats
        const userStats = await statsService.fetchStat(req.user!.userId);
        if (userStats) {
            userStats.debtTransfers += 1;
            await userStats.save(); 
        }

        await transactionService.createTransaction(data)
        
        return res.status(200).json({
            success: true,
            message: "Debt transfer method updated",
            data: updatedDebt
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const listedDebt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const allDebts = await debtService.fetchListedDebt();
        return res.status(200).json({
            success: true,
            message: 'Debts fetched successfully',
            data: allDebts
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

export const listedUserDebt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.userId;

  try {
    const allDebts = await debtService.fetchListedDebt();

    if (!allDebts || allDebts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No debts found',
      });
    }

    // filter user debt
    const userDebt = allDebts.filter(debt => debt.user._id.toString() === userId);

    if (userDebt.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No debts found for this user',
      });
    }
 

    return res.status(200).json({
      success: true,
      message: 'Debts fetched successfully',
      data: userDebt,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};


export const acceptDebt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { debtId } = req.params;
    const userId = req.user!.userId;

    try {
        const debt = await debtService.fetchDebt(debtId);
        
        if (!debt ||  debt.transferStatus === 'accepted') {
            return res.status(403).json({ 
                success: false, 
                message: "Debt already paid " 
            });
        }

        const user = await userServices.fetchUserById(userId);
        const beneficiary = await userServices.fetchUserById(debt.user.toHexString());
        const userAcc = await accServices.fetchAccount(userId);
        const debtAcc = await accServices.fetchAccount(debt.user.toHexString())

        if(debt.amount > userAcc!.balance) {
            return res.status(400).json({
                success: false,
                message: 'Insurficient funds'
            })
            }
        
        const newBal = userAcc!.balance - debt.amount;
        const balCoins = userAcc!.coins + debt.incentives;
        const debtCoinBal = debtAcc!.balance - debt.incentives;

        await debtService.updateDebt(debtId, { isCleared: true });
        await accServices.updateAcc(userId, { type: userAcc!.type, balance: newBal, coins: balCoins });
        await accServices.updateAcc(debt.user.toHexString(), { type: debtAcc!.type, coins: debtCoinBal });
        await transactionService.fetchUpdateTransaction(debtId, { status: 'Complete' });

        debt.acceptedBy = new Types.ObjectId(userId);
        debt.transferStatus = 'accepted';
        await debt.save();

        await notificationService.createNotification({
            userId: debt.user.toString(),
            title: 'Debt Accepted',
            message: `Your debt of ₦${debt.amount} was paid by ${user?.fullName}.`,
            type: 'debt_status'
        });

        await notificationService.createNotification({
            userId: userId,
            title: 'Debt Cleared',
            message: `You cleared a debt of ₦${debt.amount} for ${beneficiary?.fullName}.`,
            type: 'payment'
        });

        await transactionService.createTransaction({
              user: user!._id,
              amount: debt.amount,
              type: 'Transfer',
              status: 'complete',
              fundType: 'DEBIT',
              recipient: beneficiary?.fullName
            })


        const userStats = await statsService.fetchStat(req.user!.userId);
        if (userStats) {
            userStats.helped += 1;

            userStats.successRate = userStats.debtTransfers > 0
                ? ( userStats.debtTransfers / userStats.helped ) * 100 : 0;

            await userStats.save();
        }

        // Configure Nodemailer
        const transporter = nodemailer.createTransport({
        host: 'mail.gbese.com.ng',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS 
        }
        });
    
    
        // Send the email
        await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL,
        subject: 'Debt Payment',
        html: `<p>Debt paid by ${user?.fullName} to <br/> <strong> ${debt.bankName}, ${debt.accountNumber}, ${debt.accountName}, ${debt.bankCode} </strong>.</p>`
    
        });

        return res.status(200).json({ 
            success: true, 
            message: "Debt accepted and paid successfully", 
        });
    } catch (error: any) {
        return res.status(500).json({
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
        const user = await userServices.fetchUserById(userId);

        if (!debt || debt.transferTarget?.toString() !== userId || debt.transferStatus !== 'pending') {
            return res.status(403).json({
                success: false,
                message: "Not authorized to reject this debt"
            });
        }

        // Mark debt as declined
        debt.transferStatus = 'rejected';
        await debt.save();

        // Notify the original user
        await notificationService.createNotification({
            userId: debt.user.toString(),
            title: 'Debt Rejected',
            message: `Your debt of ₦${debt.amount} was rejected by ${user?.fullName}.`,
            type: 'debt_status'
        });

        await transactionService.fetchUpdateTransaction(debtId, { status: 'Failed'})

        await transactionService.createTransaction({
              user: user!._id,
              amount: debt.amount,
              type: 'Declined',
              status: 'Failed',
              fundType: 'DEBIT',
              recipient: ""
            })

        return res.status(200).json({
            success: true,
            message: "Debt rejected",
            data: debt
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};


