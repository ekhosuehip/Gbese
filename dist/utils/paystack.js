"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentTransaction = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET;
const createPaymentTransaction = async ({ email, amount, metadata }) => {
    const response = await axios_1.default.post('https://api.paystack.co/transaction/initialize', {
        email,
        amount: amount * 100, // Paystack expects amount in kobo
        metadata,
    }, {
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data.data;
};
exports.createPaymentTransaction = createPaymentTransaction;
