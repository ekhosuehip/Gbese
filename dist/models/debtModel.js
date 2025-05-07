"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const debtSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true },
    accountNumber: { type: String, required: true, trim: true },
    accountName: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    bankCode: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
    amount: { type: Number, required: true },
    statement: { type: String },
    interestRate: { type: Number, default: 0 },
    incentives: { type: Number, required: true },
    dueDate: { type: String, required: true, trim: true },
    status: { type: String, required: true },
    isListed: { type: Boolean, default: false },
    transferMethod: {
        type: String,
        enum: ['marketplace', 'direct', 'link'],
        default: null,
    },
    isCleared: { type: Boolean, default: false },
    isTransferred: { type: Boolean, default: false },
    transferTargets: { type: mongoose_1.Types.ObjectId, ref: 'User' },
    paymentLink: { type: String },
}, { timestamps: true, versionKey: false });
const Debt = (0, mongoose_1.model)("Debt", debtSchema);
exports.default = Debt;
