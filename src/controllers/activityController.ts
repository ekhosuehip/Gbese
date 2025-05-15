import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import notificationService from "../services/notificationService";
import transactionService from "../services/transactionServic";
import accServices from "../services/accountServices";
import userServices from "../services/userServices";
import requestService from "../services/requestServices";
import { createPaymentTransaction } from '../utils/paystack';
import nodemailer from 'nodemailer';
import dayjs from 'dayjs';




export const getNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.userId;
  try {
    const notifications = await notificationService.fetchNotification(userId)

    if (notifications.length < 1) {
      return res.status(200).json({
        success: true,
        message: 'No notification found'
      })
    }
    return res.status(200).json({ 
      success: true,
      message: 'Notifications fetched successfully', 
      data: notifications 
    });
  } catch (error: any) {
    return res.status(500).json({ 
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
      return res.status(200).json({
        success: true,
        message: 'No recent transaction'
      })
    }
    return res.status(200).json({
      success: true,
      message: 'Transactions fetched successfully',
      data: transactions
    })
  } catch (error: any) {
    return res.status(500).json({ 
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
      return res.status(401).json({
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

    return res.status(200).json({
      success: true,
      message: 'Funding link created',
      data: paymentLink
    })


  } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
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

    const formattedDate = dayjs().format('MMMM D, YYYY');

    const year = new Date().getFullYear();
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    const reference = `INV-EXT-${year}-${randomDigits}`;

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
      message: 'Transfer successful',
      data: {
        to: receiverData.fullName,
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

export const sendMoneyExternal = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.userId;
  const { amount, bankName, accNumber, accName } = req.body;

  try {
    // convert amount input to number
    const rawAmount = Number(amount);
    const amountWithCharge = rawAmount + 50
    const amountToNumber = parseFloat(amountWithCharge.toFixed(2));
    console.log(amountToNumber);
    
    // fetch user account data
    const user = await accServices.fetchAccount(userId);
      
    if (user!.balance < amountWithCharge) {
      return res.status(409).json({
        success: false,
        message: 'Insufficient funds'
      })
    }

    const userBal = user!.balance - amountWithCharge;
    const userCoins = user!.coins + 5;

    const formattedDate = dayjs().format('MMMM D, YYYY');

    const year = new Date().getFullYear();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const reference = `INV-EXT-${year}-${randomDigits}`;

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
      recipient: accName
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
      message: 'Transfer successful',
      data: {
        to: accName,
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

export const requestMoney = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.userId;
  const { amount, purpose, dueDate, note} = req.body;
  const { receiverId } = req.params;

  try {
    // convert amount input to number
    const rawAmount = Number(amount);
    const amountToNumber = (Number.isInteger(rawAmount) ? (rawAmount + ".00") : rawAmount.toString());

    // fetch receiver
    const receiverData = await userServices.fetchUserById(receiverId);
    
    if (!receiverData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receiver details'
      })
    }

    const year = new Date().getFullYear();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const reference = `INV-EXT-${year}-${randomDigits}`;

    const formattedDate = dayjs(dueDate).format("MMMM D, YYYY");

    const userData = await userServices.fetchUserById(userId);
    const transactionId = await transactionService.createTransaction({
      user: userData!._id,
      amount: parseFloat(amountToNumber),
      type: 'Request',
      status: 'Pending',
      fundType: 'DEBIT',
      recipient: receiverData?.fullName
    })

    await requestService.createRequest({
      user: userData!._id,
      receiver: receiverData._id,
      dueDate: dueDate,
      amount: amount,
      description: note || "",
      refrence: reference,
      status: 'pending',
      transactionId: transactionId._id
    })
  
    await notificationService.createNotification({
      userId: userId,
      title: 'Request',
      message: `You requested #${amountToNumber} from ${receiverData.fullName} for ${purpose}`,
      type: 'fund_account'
    });
    
    await notificationService.createNotification({
      userId: receiverId,
      title: 'Transfer',
      message: `${userData?.fullName} has requested #${amountToNumber} from you`,
      type: 'payment'
    })

    return res.status(200).json({
      success: true,
      message: 'Request successful',
      data: {
        to: receiverData.fullName,
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

export const acceptRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { requestId } = req.params;
  const userId = req.user!.userId;

  try {
    const request = await requestService.fetchRequest(requestId);
    console.log(request);
    console.log(userId);
    
    const userAcc = await accServices.fetchAccount(userId);
    if (!request || userId !== request.receiver.toHexString() || request.status === "accepted") {
      return res.status(400).json({
        success: false,
        message: 'Invalid input'
      })
    }

    const receiverIdString = request.user.toHexString()

    const receiver = await accServices.fetchAccount(receiverIdString);
    const receiverData = await userServices.fetchUserById(receiverIdString);
    const userData = await userServices.fetchUserById(userId);
    
    const reqAmount = Number(request.amount)
    if(reqAmount > userAcc!.balance) {
      return res.status(400).json({
        success: false,
        message: 'Insurficient funds'
      })
    }

    
    const userBal = userAcc!.balance - reqAmount;
    const receiverbal = receiver!.balance + reqAmount;
    const userCoins = userAcc!.coins + 3;

    await accServices.updateAcc(userId, {type: userAcc!.type, balance: userBal, coins: userCoins});
    await accServices.updateAcc(receiverIdString, {type: receiver!.type, balance: receiverbal});
    await transactionService.fetchUpdateTransaction(request.transactionId.toHexString(),{ status: 'Complete' });

    // Notify the original user
    await notificationService.createNotification({
      userId: receiverIdString,
      title: 'Request Accepted',
      message: `Your Request to ${userData?.fullName} was acceptedd`,
      type: 'payment'
    })

    await notificationService.createNotification({
      userId: userId,
      title: 'Transfer',
      message: `Your transfer of #${request.amount} to ${receiverData?.fullName} was successful`,
      type: 'payment'
    })

    await transactionService.createTransaction({
      user: userData!._id,
      amount: request.amount,
      type: 'Transfer',
      status: 'complete',
      fundType: 'DEBIT',
      recipient: receiverData?.fullName
    })

    request.status = 'accepted';
    await request.save();


    return res.status(200).json({
      success: true,
      message: 'Payment successful'
    })
    
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
}

export const rejectRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { requestId } = req.params;
  const userId = req.user!.userId;

  try {
    const request = await requestService.fetchRequest(requestId);
    const user = await userServices.fetchUserById(userId);

    if (!request || request.receiver?.toString() !== userId || request.status !== 'pending') {
        return res.status(403).json({
            success: false,
            message: "Not authorized to reject this request"
        });
    }

    const beneficiary = await userServices.fetchUserById(request.user.toHexString());

    request.status = 'declined';
    await request.save();

    // Notify the original user
    await notificationService.createNotification({
        userId: request.user.toString(),
        title: 'Debt Rejected',
        message: `Your request of ₦${request.amount} was rejected by ${user?.fullName}.`,
        type: 'debt_status'
    });

    await notificationService.createNotification({
        userId: user!._id.toString(),
        title: 'Debt Rejected',
        message: `You rejected a request of ₦${request.amount} from ${beneficiary?.fullName}.`,
        type: 'debt_status'
    });

    await transactionService.fetchUpdateTransaction(request.transactionId.toHexString(),{ status: 'Failed' })

    await transactionService.createTransaction({
          user: user!._id,
          amount: request.amount,
          type: 'Declined',
          status: 'Failed',
          fundType: 'DEBIT',
          recipient: ""
        })

    return res.status(200).json({
        success: true,
        message: "Request rejected",
    });

  } catch (error: any) {
    return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
    });
  }
};

export const getRequests = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.userId;
  console.log(userId);
  
  try {
    // fetch requests
    const requests = await requestService.fetchRequests(userId);
    if (!requests){
      return res.status(400).json({
        success: false,
        message: 'No request found for this user'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Requests fetched succesfully',
      requests: requests
    })
  } catch (error: any) {
    return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
    });
  }
}