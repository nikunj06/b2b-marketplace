// server.js - Main Express application

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

// ---- Middleware ----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'frontend')));

// ---- API Routes ----
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders',   require('./routes/orderRoutes'));
app.use('/api/admin',    require('./routes/adminRoutes'));

// ---- Health Check ----
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'B2B Marketplace API is running.' });
});

// ---- Start Server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📊 API Base URL: http://localhost:${PORT}/api/register`);
});
