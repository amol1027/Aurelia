const express = require('express');
const cors = require('cors');
const pool = require('./db');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', authRoutes);

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

app.listen(PORT, () => {
    console.log(`🐾 Aurelia API running on http://localhost:${PORT}`);
});
