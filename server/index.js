const express = require('express');
const cors = require('cors');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');
const usersRoutes = require('./routes/users');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', authRoutes);

// Favorites routes
app.use('/api/favorites', favoritesRoutes);

// Admin users management routes
app.use('/api/admin/users', usersRoutes);

// GET all pets
app.get('/api/pets', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pets ORDER BY id');
        // Parse personality JSON strings for each pet
        const pets = rows.map((pet) => ({
            ...pet,
            personality: typeof pet.personality === 'string' ? JSON.parse(pet.personality) : pet.personality,
        }));
        res.json(pets);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Failed to fetch pets' });
    }
});

// GET single pet
app.get('/api/pets/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pets WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Pet not found' });
        }
        const pet = {
            ...rows[0],
            personality: typeof rows[0].personality === 'string' ? JSON.parse(rows[0].personality) : rows[0].personality,
        };
        res.json(pet);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Failed to fetch pet' });
    }
});

// GET admin stats
app.get('/api/admin/stats', async (req, res) => {
    try {
        const [[totalUsersRow]] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [[adoptersRow]] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "adopter"');
        const [[sheltersRow]] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "shelter"');
        const [[totalPetsRow]] = await pool.query('SELECT COUNT(*) as count FROM pets');
        res.json({
            totalUsers: totalUsersRow.count,
            adopters: adoptersRow.count,
            shelters: sheltersRow.count,
            totalPets: totalPetsRow.count,
        });
    } catch (err) {
        console.error('Admin stats error:', err.message);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

app.listen(PORT, () => {
    console.log(`🐾 Aurelia API running on http://localhost:${PORT}`);
});
