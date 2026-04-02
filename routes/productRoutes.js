// routes/productRoutes.js
const express    = require('express');
const router     = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const checkRole   = require('../middleware/roleMiddleware');
const {
    addProduct,
    getAllProducts,
    getManufacturerProducts,
    updateInventory
} = require('../controllers/productController');

router.post('/add',                   verifyToken, checkRole('manufacturer'), addProduct);
router.get('/all',                    verifyToken, getAllProducts);
router.get('/manufacturer/:id',       verifyToken, getManufacturerProducts);
router.put('/inventory/update',       verifyToken, checkRole('manufacturer'), updateInventory);

module.exports = router;
