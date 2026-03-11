const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'aurelia_secret_key_2024';
const JWT_EXPIRES_IN = '7d';

// ─── REGISTER ───
router.post('/register', async (req, res) => {
    try {
        const { role, name, email, password, phone, shelterName, address } = req.body;

        // Validation
        if (!role || !name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, password, and role are required' });
        }

        if (!['adopter', 'shelter'].includes(role)) {
            return res.status(400).json({ error: 'Role must be "adopter" or "shelter"' });
        }

        if (role === 'shelter' && !shelterName) {
            return res.status(400).json({ error: 'Shelter name is required for shelter accounts' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if email already exists
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await pool.execute(
            `INSERT INTO users (role, name, email, password, phone, shelter_name, address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [role, name, email, hashedPassword, phone || null, shelterName || null, address || null]
        );

        // Generate token
        const token = jwt.sign(
            { id: result.insertId, role, email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: result.insertId,
                role,
                name,
                email,
                phone: phone || null,
                shelterName: shelterName || null,
            },
        });
    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// ─── LOGIN ───
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check for hardcoded admin credentials
        if (email === 'admin@gmail.com' && password === '123456') {
            const token = jwt.sign(
                { id: 0, role: 'admin', email: 'admin' },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            return res.json({
                message: 'Admin login successful',
                token,
                user: {
                    id: 0,
                    role: 'admin',
                    name: 'Administrator',
                    email: 'admin',
                    phone: null,
                    shelterName: null,
                },
            });
        }

        // Find user
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                role: user.role,
                name: user.name,
                email: user.email,
                phone: user.phone,
                shelterName: user.shelter_name,
            },
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

// ─── GET CURRENT USER (protected) ───
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        // Handle admin user
        if (decoded.role === 'admin' && decoded.id === 0) {
            return res.json({
                id: 0,
                role: 'admin',
                name: 'Administrator',
                email: 'admin',
                phone: null,
                shelterName: null,
                address: null,
                createdAt: new Date().toISOString(),
            });
        }

        const [users] = await pool.query(
            'SELECT id, role, name, email, phone, shelter_name, address, created_at FROM users WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];
        res.json({
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            phone: user.phone,
            shelterName: user.shelter_name,
            address: user.address,
            createdAt: user.created_at,
        });
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        console.error('Auth error:', err.message);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

module.exports = router;
