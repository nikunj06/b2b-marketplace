// routes/authRoutes.js
const express = require('express');
const router  = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { validateBody } = require('../middleware/validator');
const { registerSchema, loginSchema } = require('../validators/authValidator');

router.post('/register', validateBody(registerSchema), register);
router.post('/login',    validateBody(loginSchema), login);
router.post('/logout',   logout);

module.exports = router;
