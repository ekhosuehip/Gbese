import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import notificationService from "../services/notificationService";
import transactionService from "../services/transactionServic";
import accServices from "../services/accountServices";
import userServices from "../services/userServices";
import banksServices from "../services/bankService";
import { createPaymentTransaction, resolveBank } from '../utils/paystack';
import nodemailer from 'nodemailer';
 import dayjs from 'dayjs';



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
  const email = req.user?.email

  try {

    if(!email ){
      res.status(401).json({
        sucess: false,
        message: 'Unauthorized user'
      })
    }

    //create payment link
    const paymentTransaction = await createPaymentTransaction({
      email: req.user!.email,
      amount: amount,
      metadata: {
          type: 'fund_account',
          accId: userId
      }
    });

    const paymentLink = paymentTransaction.authorization_url

    res.status(200).json({
      success: true,
      message: 'Funding link created',
      data: paymentLink
    })


  } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
      return;
    }
}

export const sendMoneyInternalData = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { amount, accNumber, note } = req.body;

  try {
    // convert amount input to number
    const rawAmount = Number(amount);
    const amountToNumber = (Number.isInteger(rawAmount) ? (rawAmount + ".00") : rawAmount.toString());

    // fetch receiver
    const receiver = await userServices.fetchUser('234'+accNumber);
    if(!receiver){
      return res.status(400).json({
        success: false,
        message: 'Wrong account number'
      })
    }

  
    const formattedDate = dayjs().format('MMMM D, YYYY');

    const year = new Date().getFullYear();
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    const reference = `INV-EXT-${year}-${randomDigits}`;
    
    console.log(reference);

    console.log(formattedDate);

    return res.status(200).json({
      success: true,
      message: 'Transaction details',
      data: {
        to: receiver.fullName,
        date: formattedDate,
        amount: amount,
        bank: 'Gbese',
        reference: reference,
        fee: '#00.00',
        total: `#${amountToNumber}`
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

export const sendMoneyInternal = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.userId;
  const { amount, accNumber ,note } = req.body;

  try {
    // convert amount input to number
    const rawAmount = Number(amount);
    const amountToNumber = parseFloat(rawAmount.toFixed(2));
    console.log(accNumber);
    

    // fetch receiver
    const receiverData = await userServices.fetchUser('234'+accNumber);
    
    console.log(receiverData);
    
    if (!receiverData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receiver details'
      })
    }

    const receiver = await accServices.fetchAccount(receiverData._id.toHexString());
    console.log(receiver);



    // fetch user account data
    const user = await accServices.fetchAccount(userId);
    if (user!.balance < amountToNumber) {
      return res.status(409).json({
        success: false,
        message: 'Insufficient funds'
      })
    }

    const userData = await userServices.fetchUserById(userId);

    const userBal = user!.balance - amountToNumber;
    const userCoins = user!.coins + 5;
    const receiverBal = receiver!.balance + amountToNumber;
    const receiverCoins = receiver!.coins + 2;

    await accServices.updateAcc(userId, {type: user!.type, balance: userBal, coins: userCoins});
    
    await notificationService.createNotification({
      userId: userId,
      title: 'Transfer',
      message: `Your transfer of #${amountToNumber} to ${receiverData?.fullName} was successful`,
      type: 'payment'
    })

    await transactionService.createTransaction({
      user: user!._id,
      amount: amountToNumber,
      type: 'Transfer',
      status: 'complete',
      fundType: 'DEBIT',
      recipient: receiverData?.fullName
    })
    
    await accServices.updateAcc(receiver!._id.toHexString(), {type: receiver!.type ,balance: receiverBal, coins: receiverCoins});
    
    await notificationService.createNotification({
      userId: receiver!._id.toHexString(),
      title: 'Transfer',
      message: `Your account have been credited with #${amountToNumber} by ${userData?.fullName}`,
      type: 'fund_account'
    })

    await transactionService.createTransaction({
      user: receiverData!._id,
      amount: amountToNumber,
      type: 'Receive',
      status: 'Complete',
      fundType: 'CREDIT',
    })

    return res.status(200).json({
      success: true,
      message: 'Transfer successful'
    })
    
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }

}

export const sendMoneyExternalData = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.userId;
  const { amount, bankName, accNumber, note } = req.body;

  try {
    // convert amount input to number
    const rawAmount = Number(amount);
    const amountWithCharge = rawAmount + 50
    const amountToNumber = (Number.isInteger(amountWithCharge) ? (amountWithCharge + ".00") : amountWithCharge.toString());

    
  console.log(amountToNumber);
  
    // fetch bank data
    const bankData = await banksServices.fetchBank(bankName);
    
    
    if (!bankData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bank details'
      })
    }

    //Verify account data
    const accData = await resolveBank(accNumber, bankData.code)
    if (!accData || accData.status !== true) {
        return res.status(400).json({
            success: false,
            message: 'Account not found',
        });
      }
   
  
    const formattedDate = dayjs().format('MMMM D, YYYY');

    const year = new Date().getFullYear();
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    const reference = `INV-EXT-${year}-${randomDigits}`;
    
    console.log(reference);

    console.log(formattedDate);

    return res.status(200).json({
      success: true,
      message: 'Transaction details',
      data: {
        to: accData.data.account_name,
        date: formattedDate,
        amount: amount,
        bank: bankName,
        reference: reference,
        fee: '#50.00',
        total: `#${amountToNumber}`
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

export const sendMoneyExternal = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.userId;
  const { amount, bankName, accNumber, accName, reference } = req.body;

  try {
    // convert amount input to number
    const rawAmount = Number(amount);
    const amountWithCharge = rawAmount + 50
    const amountToNumber = parseFloat(amountWithCharge.toFixed(2));
    console.log(amountToNumber);
    
    // fetch user account data
    const user = await accServices.fetchAccount(userId);

    
      
    if (user!.balance < amountToNumber) {
      return res.status(409).json({
        success: false,
        message: 'Insufficient funds'
      })
    }
    console.log("funds");
    

    const userBal = user!.balance - amountToNumber;
    const userCoins = user!.coins + 5;

    await accServices.updateAcc(userId, {type: user!.type, balance: userBal, coins: userCoins});
    
    await notificationService.createNotification({
      userId: userId,
      title: 'Transfer',
      message: `Your transfer of #${amountToNumber} to ${accName} was successful`,
      type: 'payment'
    })

    await transactionService.createTransaction({
      user: user!._id,
      amount: amountToNumber,
      type: 'Transfer',
      status: 'complete',
      fundType: 'DEBIT',
      recipient: reference
    })


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
      subject: 'Transfer Initiated',
      html: `<p>Transfer has been initiated to <strong>${accName}, ${accNumber} ${bankName}</strong>. by ${user!.accNumber}</p>`

    });

    return res.status(200).json({
      success: true,
      message: 'Transfer successful'
    })
    
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }

}

export const requestMoneyData = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { amount, purpose, dueDate, note} = req.body;
  const { receiverId } = req.params;

  try {
    const receiver = await userServices.fetchUserById(receiverId)
    if (!receiver) {
      return res.status(400).json({
        success: false,
        message: 'Invalind receiver Id'
      })
    }

    // convert amount input to number
    const rawAmount = Number(amount);
    const amountToNumber = (Number.isInteger(rawAmount) ? (rawAmount + ".00") : rawAmount.toString());

    const year = new Date().getFullYear();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const reference = `INV-EXT-${year}-${randomDigits}`;

    const formattedDate = dayjs(dueDate).format("MMMM D, YYYY");
    return res.status(200).json({
      success: true,
      message: 'Review Request',
      data: {
        to: receiver.fullName,
        dueDate: formattedDate,
        amount: `#${amountToNumber}`,
        description: purpose,
        refrence: reference
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

export const requestMoney = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.userId;
  const { amount, purpose, dueDate, reference } = req.body;
  const { receiverId } = req.params;

  try {
    // convert amount input to number
    const rawAmount = Number(amount);
    const amountToNumber = (Number.isInteger(rawAmount) ? (rawAmount + ".00") : rawAmount.toString());


    // fetch receiver
    const receiverData = await userServices.fetchUserById(receiverId);
    
    console.log(receiverData);
    
    if (!receiverData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receiver details'
      })
    }


    const userData = await userServices.fetchUserById(userId);

    await notificationService.createNotification({
      userId: userId,
      title: 'Request',
      message: `You requested #${amountToNumber} from ${receiverData.fullName} for ${purpose}`,
      type: 'debt_status'
    })

    await transactionService.createTransaction({
      user: userData!._id,
      amount: parseFloat(amountToNumber),
      type: 'Transfer',
      status: 'Pending',
      fundType: 'DEBIT',
      recipient: receiverData?.fullName
    })
    
    await notificationService.createNotification({
      userId: receiverId,
      title: 'Transfer',
      message: `${userData?.fullName} hsd requested #${amountToNumber} from you`,
      type: 'payment'
    })

    await transactionService.createTransaction({
      user: receiverData!._id,
      amount: parseFloat(amountToNumber),
      type: 'Receive',
      status: 'Pending',
      fundType: 'DEBIT',
    })

    return res.status(200).json({
      success: true,
      message: 'Request successful'
    })
    
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }

}