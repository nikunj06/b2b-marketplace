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

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const { addProductSchema, updateInventorySchema } = require('../validators/productValidator');
const { validateBody } = require('../middleware/validator');

router.post('/add',                   verifyToken, checkRole('manufacturer'), upload.single('image'), validateBody(addProductSchema), addProduct);
router.get('/all',                    verifyToken, getAllProducts);
router.get('/manufacturer/:id',       verifyToken, getManufacturerProducts);
router.put('/inventory/update',       verifyToken, checkRole('manufacturer'), validateBody(updateInventorySchema), updateInventory);

module.exports = router;
