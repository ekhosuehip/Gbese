"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debtSchema = exports.userSchema = exports.phoneSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.phoneSchema = {
    getOTP: joi_1.default.object({
        phone: joi_1.default.string()
            .pattern(/^(234[0-9]{9,10}|0[0-9]{10}|[0-9]{10})$/)
            .required()
            .messages({
            'string.pattern.base': 'Phone number must be in the format 234XXXXXXXXX (10 digits), 234XXXXXXXXXX (11 digits), 0XXXXXXXXX (10 digits), or 10 digits long',
            'string.empty': 'Phone number is required',
        }),
    }),
    verify: joi_1.default.object({
        otp: joi_1.default.string()
            .length(5)
            .pattern(/^[0-9]{5}$/)
            .required()
            .messages({
            'string.length': 'OTP must be exactly 5 digits long',
            'any.required': 'OTP is required',
        }),
        key: joi_1.default.string().required().messages({
            'string.empty': 'Key is required.',
        }),
    }),
};
exports.userSchema = {
    signInData: joi_1.default.object({
        key: joi_1.default.string().required().messages({
            'string.empty': 'Key is required.',
        }),
        fullName: joi_1.default.string().min(3).max(100).required().messages({
            'string.empty': 'Full name is required.',
            'string.min': 'Full name must be at least 3 characters.',
            'string.max': 'Full name must not exceed 100 characters.',
        }),
        email: joi_1.default.string()
            .email({ minDomainSegments: 2, tlds: { allow: false } }) // tlds open (no restriction)
            .required()
            .messages({
            'string.email': 'Please provide a valid email address.',
            'string.empty': 'Email is required.',
        }),
        password: joi_1.default.string()
            .min(6)
            .required()
            .messages({
            'string.empty': 'Password is required.',
            'string.min': 'Password must be at least 6 characters long.',
        }),
        dateOfBirth: joi_1.default.date()
            .iso()
            .required()
            .messages({
            'date.base': 'Date of birth must be a valid date.',
            'any.required': 'Date of birth is required.',
        }),
        gender: joi_1.default.string()
            .valid('male', 'female')
            .required()
            .messages({
            'any.only': 'Gender must be either male or female.',
            'string.empty': 'Gender is required.',
        }),
    }),
};
exports.debtSchema = {
    createDebtData: joi_1.default.object({
        bankCode: joi_1.default.string().required().messages({
            'string.empty': 'Bank code is required.',
        }),
        debtSource: joi_1.default.string().trim().required().messages({
            'string.empty': 'Bank name is required.',
        }),
        accountNumber: joi_1.default.string().trim().required().messages({
            'string.empty': 'Account number is required.',
        }),
        description: joi_1.default.string().allow('').optional().messages({
            'string.base': 'Note must be a string.',
        }),
        amount: joi_1.default.number().required().messages({
            'number.base': 'Amount must be a number.',
            'any.required': 'Amount is required.',
        }),
        dueDate: joi_1.default.string().isoDate().required().messages({
            'string.isoDate': 'Due date must be a valid ISO date.',
            'string.empty': 'Due date is required.',
        }),
        interestRate: joi_1.default.number().optional().messages({
            'number.base': 'Interest rate must be a number.',
        }),
        incentives: joi_1.default.number().required().messages({
            'number.base': 'Incentives must be a number.',
            'any.required': 'Incentives are required.',
        }),
    }),
};
