// routes/adminRoutes.js
const express     = require('express');
const router      = express.Router();
const verifyToken  = require('../middleware/authMiddleware');
const checkRole    = require('../middleware/roleMiddleware');
const {
    getAllUsers,
    getAllOrders,
    getAllInventory,
    getDashboardStats
} = require('../controllers/adminController');

router.get('/users',     verifyToken, checkRole('admin'), getAllUsers);
router.get('/orders',    verifyToken, checkRole('admin'), getAllOrders);
router.get('/inventory', verifyToken, checkRole('admin'), getAllInventory);
router.get('/stats',     verifyToken, checkRole('admin'), getDashboardStats);

module.exports = router;
