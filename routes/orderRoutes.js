// routes/orderRoutes.js
const express     = require('express');
const router      = express.Router();
const verifyToken  = require('../middleware/authMiddleware');
const checkRole    = require('../middleware/roleMiddleware');
const {
    placeOrder,
    getRetailerOrders,
    getManufacturerOrders,
    updateOrderStatus
} = require('../controllers/orderController');

router.post('/place',             verifyToken, checkRole('retailer'),      placeOrder);
router.get('/retailer/:id',       verifyToken, checkRole('retailer','admin'), getRetailerOrders);
router.get('/manufacturer/:id',   verifyToken, checkRole('manufacturer','admin'), getManufacturerOrders);
router.put('/status',             verifyToken, checkRole('manufacturer','admin'), updateOrderStatus);

module.exports = router;
