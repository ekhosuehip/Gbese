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
        .length(5)
        .pattern(/^[0-9]{5}$/)
        .required()
        .messages({
            'string.length': 'OTP must be exactly 5 digits long',
            'any.required': 'OTP is required',
        }),
        key: Joi.string()
        .length(10)
        .pattern(/^[a-z0-9]+$/)
        .required()
        .messages({
            'string.length': 'Key must be exactly 10 characters',
            'any.required': 'Key is required',
        }),
    }),
};
