const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'aurelia_secret_key_2024';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT verification error:', err.message);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// GET user's favorites
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT pet_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        const petIds = rows.map(row => row.pet_id);
        res.json(petIds);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

// POST add favorite
router.post('/', authenticateToken, async (req, res) => {
    const { petId } = req.body;

    console.log('Add favorite request:', { userId: req.user.id, petId });

    if (!petId) {
        return res.status(400).json({ error: 'Pet ID is required' });
    }

    try {
        // Check if pet exists
        const [pets] = await pool.query('SELECT id FROM pets WHERE id = ?', [petId]);
        if (pets.length === 0) {
            console.log('Pet not found:', petId);
            return res.status(404).json({ error: 'Pet not found' });
        }

        // Add to favorites (ON DUPLICATE KEY handles if already exists)
        await pool.query(
            'INSERT INTO favorites (user_id, pet_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP',
            [req.user.id, petId]
        );

        console.log('Added to favorites successfully');
        res.status(201).json({ message: 'Added to favorites', petId });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Failed to add favorite' });
    }
});

// DELETE remove favorite
router.delete('/:petId', authenticateToken, async (req, res) => {
    const { petId } = req.params;

    try {
        const [result] = await pool.query(
            'DELETE FROM favorites WHERE user_id = ? AND pet_id = ?',
            [req.user.id, petId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        res.json({ message: 'Removed from favorites', petId });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Failed to remove favorite' });
    }
});

module.exports = router;
