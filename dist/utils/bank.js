"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBank = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;
const resolveBank = async (accNumber, bankCode) => {
    try {
        const response = await axios_1.default.get('https://api.paystack.co/bank/resolve', {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`
            },
            params: {
                account_number: accNumber,
                bank_code: bankCode
            }
        });
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        console.error('Error resolving account:', error.response?.data || error.message);
        throw new Error('Bank resolution failed');
    }
};
exports.resolveBank = resolveBank;
