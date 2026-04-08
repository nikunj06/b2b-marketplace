// server.js - Main Express application

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

const cookieParser = require('cookie-parser');
const rateLimit    = require('express-rate-limit');

// ---- Middleware ----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root redirect
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// ---- API Routes ----
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Increased for dev testing
    message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/auth',     authLimiter, require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders',   require('./routes/orderRoutes'));
app.use('/api/admin',    require('./routes/adminRoutes'));
app.use('/api/cart',     require('./routes/cartRoutes'));

// ---- Health Check ----
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'B2B Marketplace API is running.' });
});

// ---- Global Error Handler ----
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// ---- Start Server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📊 API Base URL: http://localhost:${PORT}/api/auth/register`);
});
