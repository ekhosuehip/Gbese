"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePaystackWebhook = void 0;
const debtServices_1 = __importDefault(require("../services/debtServices"));
const accountServices_1 = __importDefault(require("../services/accountServices"));
const dotenv_1 = require("dotenv");
const crypto_1 = __importDefault(require("crypto"));
(0, dotenv_1.config)();
const secret = process.env.PAYSTACK_SECRET;
const handlePaystackWebhook = async (req, res, next) => {
    // Log the headers to check if 'x-paystack-signature' exists
    console.log('Request headers:', req.headers);
    try {
        const signature = req.headers['x-paystack-signature'] || req.headers['X-Paystack-Signature'];
        if (!signature) {
            res.status(400).json({
                success: false,
                message: 'Missing Paystack signature in the request headers'
            });
            return;
        }
        const hash = crypto_1.default.createHmac('sha512', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');
        console.log('Computed hash:', hash);
        console.log('Paystack signature:', signature);
        if (hash !== signature) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid signature'
            });
            return;
        }
        const event = req.body;
        console.log("Webhook received:", event.event);
        console.log('webhook req', event);
        if (event.event === 'charge.success') {
            const metadata = event.data.metadata;
            const debtId = metadata.debtId;
            const accId = metadata.userId;
            const amountPaid = event.data.amount / 100;
            const debt = await debtServices_1.default.fetchDebt(debtId);
            const acc = await accountServices_1.default.fetchAccount(accId);
            console.log('user account', acc);
            console.log("Account type:", acc?.type);
            console.log('coins:', acc.coins, 'incentives:', debt.incentives);
            const balCoins = acc.coins - debt.incentives;
            console.log("Calculated balCoins:", balCoins);
            if (debt && debt.amount <= amountPaid) {
                await debtServices_1.default.updateDebt(debtId, { isCleared: true });
                const updatedAcc = await accountServices_1.default.updateAcc(accId, { type: acc.type, coins: balCoins });
                console.log('Updated account:', updatedAcc);
            }
            res.status(200).send('ok');
            return;
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.handlePaystackWebhook = handlePaystackWebhook;
