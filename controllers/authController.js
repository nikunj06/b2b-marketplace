// controllers/authController.js

const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const db     = require('../db');

const JWT_SECRET  = process.env.JWT_SECRET  || 'b2b_secret_key_2024';
const SALT_ROUNDS = 10;

// POST /api/auth/register
async function register(req, res) {
    const { name, email, password, role, company_name, gst_number, business_name } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Name, email, password and role are required.' });
    }

    if (!['manufacturer', 'retailer'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Role must be manufacturer or retailer.' });
    }

    try {
        // Check if email already exists
        const [existing] = await db.execute('SELECT user_id FROM Users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already registered.' });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert into Users
        const [result] = await db.execute(
            'INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashed, role]
        );
        const user_id = result.insertId;

        // Insert into role-specific table
        if (role === 'manufacturer') {
            if (!company_name || !gst_number) {
                return res.status(400).json({ success: false, message: 'company_name and gst_number are required for manufacturers.' });
            }
            await db.execute(
                'INSERT INTO Manufacturers (user_id, company_name, gst_number) VALUES (?, ?, ?)',
                [user_id, company_name, gst_number]
            );
        } else if (role === 'retailer') {
            if (!business_name || !gst_number) {
                return res.status(400).json({ success: false, message: 'business_name and gst_number are required for retailers.' });
            }
            await db.execute(
                'INSERT INTO Retailers (user_id, business_name, gst_number) VALUES (?, ?, ?)',
                [user_id, business_name, gst_number]
            );
        }

        return res.status(201).json({ success: true, message: 'Registration successful.' });

    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
}

// POST /api/auth/login
async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    try {
        const [rows] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // Fetch role-specific ID
        let roleId = null;
        if (user.role === 'manufacturer') {
            const [m] = await db.execute('SELECT manufacturer_id FROM Manufacturers WHERE user_id = ?', [user.user_id]);
            roleId = m[0]?.manufacturer_id;
        } else if (user.role === 'retailer') {
            const [r] = await db.execute('SELECT retailer_id FROM Retailers WHERE user_id = ?', [user.user_id]);
            roleId = r[0]?.retailer_id;
        }

        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: user.role, role_id: roleId },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({
            success: true,
            token,
            user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role, role_id: roleId }
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ success: false, message: 'Server error during login.' });
    }
}

module.exports = { register, login };
