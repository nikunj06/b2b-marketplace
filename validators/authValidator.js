// validators/authValidator.js
const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.empty': 'Name is required.',
        'any.required': 'Name is required.'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'A valid email is required.',
        'any.required': 'Email is required.'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long.',
        'any.required': 'Password is required.'
    }),
    role: Joi.string().valid('manufacturer', 'retailer').required().messages({
        'any.only': 'Role must be manufacturer or retailer.',
        'any.required': 'Role is required.'
    }),
    company_name: Joi.string().when('role', {
        is: 'manufacturer',
        then: Joi.required(),
        otherwise: Joi.optional()
    }).messages({ 'any.required': 'company_name is required for manufacturers.' }),
    business_name: Joi.string().when('role', {
        is: 'retailer',
        then: Joi.required(),
        otherwise: Joi.optional()
    }).messages({ 'any.required': 'business_name is required for retailers.' }),
    gst_number: Joi.string().required().messages({
        'string.empty': 'GST number is required.',
        'any.required': 'GST number is required.'
    })
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'A valid email is required.',
        'any.required': 'Email is required.'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password is required.',
        'any.required': 'Password is required.'
    })
});

module.exports = { registerSchema, loginSchema };
