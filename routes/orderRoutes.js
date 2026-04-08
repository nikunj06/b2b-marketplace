// routes/orderRoutes.js
const express     = require('express');
const router      = express.Router();
const verifyToken  = require('../middleware/authMiddleware');
const checkRole    = require('../middleware/roleMiddleware');
const {
    placeOrder,
    checkoutCart,
    getRetailerOrders,
    getManufacturerOrders,
    updateOrderStatus
} = require('../controllers/orderController');

const { placeOrderSchema, updateOrderStatusSchema } = require('../validators/orderValidator');
const { validateBody } = require('../middleware/validator');

router.post('/place',             verifyToken, checkRole('retailer'),      validateBody(placeOrderSchema), placeOrder);
router.post('/checkout',          verifyToken, checkRole('retailer'),      checkoutCart);
router.get('/retailer/:id',       verifyToken, checkRole('retailer','admin'), getRetailerOrders);
router.get('/manufacturer/:id',   verifyToken, checkRole('manufacturer','admin'), getManufacturerOrders);
router.put('/status',             verifyToken, checkRole('manufacturer','admin'), validateBody(updateOrderStatusSchema), updateOrderStatus);

module.exports = router;
