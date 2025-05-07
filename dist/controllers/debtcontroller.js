"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listedDebt = exports.transferMethod = exports.createDebt = void 0;
const userServices_1 = __importDefault(require("../services/userServices"));
const paystack_1 = require("../utils/paystack");
const debtServices_1 = __importDefault(require("../services/debtServices"));
const bank_1 = require("../utils/bank");
const s3Service_1 = require("../utils/s3Service");
const createDebt = async (req, res, next) => {
    const { bankCode, debtSource, accountNumber, description, amount, dueDate, interestRate, incentives } = req.body;
    const statementFile = req.file;
    const userEmail = req.user.email;
    if (!statementFile) {
        res.status(400).json({
            success: false,
            message: 'Statement file is required',
        });
        return;
    }
    try {
        const user = await userServices_1.default.fetchUser(userEmail);
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'login again token expired'
            });
            return;
        }
        const imageUrl = await (0, s3Service_1.s3Upload)(statementFile);
        console.log(imageUrl);
        //Verify account data
        const accData = await (0, bank_1.resolveBank)(accountNumber, bankCode);
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
        const isOverdue = statusDate.getFullYear() < now.getFullYear() ||
            (statusDate.getFullYear() === now.getFullYear() &&
                statusDate.getMonth() < now.getMonth());
        const statusLabel = isOverdue ? 'overdue' : 'coming up';
        const newDebt = {
            user: user._id,
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
        const createdDebt = await debtServices_1.default.createDebt(newDebt);
        res.status(200).json({
            success: true,
            message: 'Debt create successfully',
            data: createdDebt
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
        return;
    }
};
exports.createDebt = createDebt;
const transferMethod = async (req, res, next) => {
    const { debtId } = req.params;
    const { transferMethod } = req.body;
    console.log(transferMethod);
    try {
        const debt = await debtServices_1.default.fetchDebt(debtId);
        console.log('here');
        if (!debt) {
            res.status(400).json({
                success: false,
                message: `No debt matching ID ${debtId} found`
            });
            return;
        }
        // Apply transfer method updates
        const updateData = {
            transferMethod: transferMethod,
            isTransferred: true
        };
        transferMethod === 'marketplace' && (updateData.isListed = true);
        console.log('there');
        const paymentTransaction = await (0, paystack_1.createPaymentTransaction)({
            email: req.user.email,
            amount: debt.amount,
            metadata: {
                debtId: debtId,
                userId: req.user.userId,
            },
        });
        updateData.paymentLink = paymentTransaction.authorization_url;
        console.log('now');
        const updatedDebt = await debtServices_1.default.updateDebt(debtId, updateData);
        console.log(updatedDebt);
        res.status(200).json({
            success: true,
            message: "Debt transfer method updated",
            data: updatedDebt
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
        return;
    }
};
exports.transferMethod = transferMethod;
const listedDebt = async (req, res, next) => {
    try {
        const allDebts = await debtServices_1.default.fetchListedDebt();
        res.status(200).json({
            success: true,
            message: 'Debts fetched successfully',
            data: allDebts
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
        return;
    }
};
exports.listedDebt = listedDebt;
