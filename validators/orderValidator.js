// validators/orderValidator.js
const Joi = require('joi');

const placeOrderSchema = Joi.object({
    manufacturer_id: Joi.number().integer().required().messages({
        'any.required': 'manufacturer_id is required.'
    }),
    product_id: Joi.number().integer().required().messages({
        'any.required': 'product_id is required.'
    }),
    quantity: Joi.number().integer().positive().required().messages({
        'number.positive': 'Quantity must be greater than 0.',
        'any.required': 'quantity is required.'
    })
});

const updateOrderStatusSchema = Joi.object({
    order_id: Joi.number().integer().required().messages({
        'any.required': 'order_id is required.'
    }),
    status: Joi.string().valid('pending', 'approved', 'rejected', 'completed').required().messages({
        'any.only': 'Status must be pending, approved, rejected, or completed.',
        'any.required': 'status is required.'
    })
});

module.exports = { placeOrderSchema, updateOrderStatusSchema };
