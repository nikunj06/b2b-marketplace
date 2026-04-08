const express = require('express');
const router  = express.Router();
const cartController = require('../controllers/cartController');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.use(verifyToken);
router.use(checkRole('retailer'));

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCartItem);
router.delete('/remove/:id', cartController.removeFromCart);
router.post('/clear', cartController.clearCart);

module.exports = router;
