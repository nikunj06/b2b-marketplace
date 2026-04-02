// middleware/authMiddleware.js - Verify JWT token

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'b2b_secret_key_2024';

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    // Token format: "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. Token missing.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { user_id, email, role }
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
}

module.exports = verifyToken;
