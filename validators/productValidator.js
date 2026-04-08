// validators/productValidator.js
const Joi = require('joi');

const addProductSchema = Joi.object({
    product_name: Joi.string().required().messages({
        'any.required': 'Product name is required.'
    }),
    category: Joi.string().required().messages({
        'any.required': 'Category is required.'
    }),
    description: Joi.string().optional().allow(''),
    minimum_order_quantity: Joi.number().integer().min(1).required().messages({
        'number.min': 'Minimum order quantity must be at least 1.',
        'any.required': 'Minimum order quantity is required.'
    }),
    stock_quantity: Joi.number().integer().min(0).required().messages({
        'number.min': 'Stock quantity cannot be negative.',
        'any.required': 'Stock quantity is required.'
    }),
    wholesale_price: Joi.number().positive().required().messages({
        'number.positive': 'Wholesale price must be greater than 0.',
        'any.required': 'Wholesale price is required.'
    })
});

const updateInventorySchema = Joi.object({
    product_id: Joi.number().integer().required().messages({
        'any.required': 'product_id is required.'
    }),
    stock_quantity: Joi.number().integer().min(0).required().messages({
        'number.min': 'Stock quantity cannot be negative.',
        'any.required': 'Stock quantity is required.'
    }),
    wholesale_price: Joi.number().positive().required().messages({
        'number.positive': 'Wholesale price must be greater than 0.',
        'any.required': 'Wholesale price is required.'
    })
});

module.exports = { addProductSchema, updateInventorySchema };
