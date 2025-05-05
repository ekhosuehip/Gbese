import Joi from 'joi';

export const phoneSchema = {
    getOTP: Joi.object({
        phone: Joi.string()
            .pattern(/^(234[0-9]{9,10}|0[0-9]{10}|[0-9]{10})$/)
            .required()
            .messages({
            'string.pattern.base': 'Phone number must be in the format 234XXXXXXXXX (10 digits), 234XXXXXXXXXX (11 digits), 0XXXXXXXXX (10 digits), or 10 digits long',
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
        key: Joi.string().required().messages({
            'string.empty': 'Key is required.',
            }),
    }),
};

export const userSchema = {
  signInData: Joi.object({
    key: Joi.string().required().messages({
      'string.empty': 'Key is required.',
    }),
    
    fullName: Joi.string().min(3).max(100).required().messages({
      'string.empty': 'Full name is required.',
      'string.min': 'Full name must be at least 3 characters.',
      'string.max': 'Full name must not exceed 100 characters.',
    }),

    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: false } }) // tlds open (no restriction)
      .required()
      .messages({
        'string.email': 'Please provide a valid email address.',
        'string.empty': 'Email is required.',
      }),

    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.empty': 'Password is required.',
        'string.min': 'Password must be at least 6 characters long.',
      }),

    dateOfBirth: Joi.date()
      .iso()
      .required()
      .messages({
        'date.base': 'Date of birth must be a valid date.',
        'any.required': 'Date of birth is required.',
      }),

    gender: Joi.string()
      .valid('male', 'female')
      .required()
      .messages({
        'any.only': 'Gender must be either male or female.',
        'string.empty': 'Gender is required.',
      }),
  }),
};

export const debtSchema = {
  createDebtData: Joi.object({
    bankCode: Joi.string().required().messages({
      'string.empty': 'Bank code is required.',
    }),

    debtSource: Joi.string().trim().required().messages({
      'string.empty': 'Bank name is required.',
    }),

    accountNumber: Joi.string().trim().required().messages({
      'string.empty': 'Account number is required.',
    }),

    description: Joi.string().allow('').optional().messages({
      'string.base': 'Note must be a string.',
    }),

    amount: Joi.number().required().messages({
      'number.base': 'Amount must be a number.',
      'any.required': 'Amount is required.',
    }),

    dueDate: Joi.string().isoDate().required().messages({
      'string.isoDate': 'Due date must be a valid ISO date.',
      'string.empty': 'Due date is required.',
    }),

    interestRate: Joi.number().optional().messages({
      'number.base': 'Interest rate must be a number.',
    }),

    incentives: Joi.number().required().messages({
      'number.base': 'Incentives must be a number.',
      'any.required': 'Incentives are required.',
    }),
  }),
};