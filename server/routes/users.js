const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'aurelia_secret_key_2024';

function authenticateAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// GET all users (admin only)
router.get('/', authenticateAdmin, async (req, res) => {
    const { role, search } = req.query;

    try {
        const filters = [];
        const values = [];

        if (role && ['adopter', 'shelter'].includes(role)) {
            filters.push('role = ?');
            values.push(role);
        }

        if (search) {
            filters.push('(name LIKE ? OR email LIKE ?)');
            values.push(`%${search}%`, `%${search}%`);
        }

        const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

        const [rows] = await pool.query(
            `SELECT id, role, name, email, phone, shelter_name, address, created_at
             FROM users
             ${whereClause}
             ORDER BY created_at DESC`,
            values
        );

        const users = rows.map((user) => ({
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            phone: user.phone,
            shelterName: user.shelter_name,
            address: user.address,
            createdAt: user.created_at,
        }));

        res.json(users);
    } catch (err) {
        console.error('Users list error:', err.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// PUT update user profile fields (admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
    const userId = Number(req.params.id);
    const { role, name, email, phone, shelterName, address } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user id' });
    }

    if (!role || !name || !email) {
        return res.status(400).json({ error: 'Role, name, and email are required' });
    }

    if (!['adopter', 'shelter'].includes(role)) {
        return res.status(400).json({ error: 'Role must be "adopter" or "shelter"' });
    }

    if (role === 'shelter' && !shelterName) {
        return res.status(400).json({ error: 'Shelter name is required for shelter role' });
    }

    try {
        const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const [emailTaken] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
        if (emailTaken.length > 0) {
            return res.status(409).json({ error: 'Email is already in use by another account' });
        }

        await pool.query(
            `UPDATE users
             SET role = ?, name = ?, email = ?, phone = ?, shelter_name = ?, address = ?
             WHERE id = ?`,
            [
                role,
                name,
                email,
                phone || null,
                role === 'shelter' ? shelterName : null,
                address || null,
                userId,
            ]
        );

        res.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('User update error:', err.message);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE user (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user id' });
    }

    try {
        const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        await pool.query('DELETE FROM users WHERE id = ?', [userId]);

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('User delete error:', err.message);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
