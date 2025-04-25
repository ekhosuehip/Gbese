import Joi from 'joi';

export const phoneSchema = {
    getOTP: Joi.object({
        phone: Joi.string()
        .pattern(/^234[0-9]{10}$/)
        .required()
        .messages({
            'string.pattern.base': 'Phone number must be in the format 234XXXXXXXXXX',
            'string.empty': 'Phone number is required',
        }),
    }),
    verify: Joi.object({
        otp: Joi.string()
        .length(4)
        .pattern(/^[0-9]{4}$/)
        .required()
        .messages({
            'string.length': 'OTP must be exactly 4 digits long',
            'string.pattern.base': 'OTP must contain only digits',
            'any.required': 'OTP is required',
        }),
        key: Joi.string()
        .length(10)
        .pattern(/^[a-z0-9]+$/)
        .required()
        .messages({
            'string.length': 'Key must be exactly 10 characters',
            'string.pattern.base': 'Key must contain only lowercase letters and numbers',
            'any.required': 'Key is required',
        }),
    }),
};
