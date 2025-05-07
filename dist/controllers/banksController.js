"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchBank = exports.fetchAllBanks = void 0;
const bankService_1 = __importDefault(require("../services/bankService"));
//Fetch all banks 
const fetchAllBanks = async (req, res, next) => {
    try {
        const banks = await bankService_1.default.fetchAllBanks();
        console.log(banks);
        res.status(200).json({
            success: true,
            message: banks.length > 0 ? 'Banks fetched successfully' : 'No banks found',
            data: banks
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error
        });
        return;
    }
};
exports.fetchAllBanks = fetchAllBanks;
// Fetch specific bank
const fetchBank = async (req, res, next) => {
    const name = req.query.bank;
    if (!name) {
        res.status(400).json({
            success: false,
            message: 'Bank name needed as quary params'
        });
        return;
    }
    try {
        const bankName = name.toUpperCase();
        const bank = await bankService_1.default.fetchBank(bankName);
        if (!bank) {
            res.status(400).json({
                success: false,
                message: ' Invalid bank name'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Bank fetched successfully',
            data: bank
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error
        });
        return;
    }
};
exports.fetchBank = fetchBank;
