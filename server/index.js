const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');
const usersRoutes = require('./routes/users');
const adoptionsRoutes = require('./routes/adoptions');
const messagesRoutes = require('./routes/messages');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'aurelia_secret_key_2024';

app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}

function requirePetManager(req, res, next) {
    if (!req.user || !['adopter', 'shelter', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Adopter, shelter, or admin access required' });
    }
    next();
}

// Auth routes
app.use('/api/auth', authRoutes);

// Favorites routes
app.use('/api/favorites', favoritesRoutes);

// Adoption routes
app.use('/api/adoptions', adoptionsRoutes);

// Messaging routes
app.use('/api/messages', messagesRoutes);

// Admin users management routes
app.use('/api/admin/users', usersRoutes);

// GET all pets
app.get('/api/pets', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
                p.*,
                u.name AS owner_name,
                u.role AS owner_role,
                u.shelter_name AS owner_shelter_name
             FROM pets p
             LEFT JOIN users u ON p.owner_user_id = u.id
             ORDER BY p.id`
        );
        // Parse personality JSON strings for each pet
        const pets = rows.map((pet) => {
            const {
                owner_user_id,
                owner_name,
                owner_role,
                owner_shelter_name,
                ...rest
            } = pet;

            return {
                ...rest,
                personality: typeof rest.personality === 'string' ? JSON.parse(rest.personality) : rest.personality,
                ownerUserId: owner_user_id || null,
                ownerName: owner_name || null,
                ownerRole: owner_role || null,
                ownerShelterName: owner_shelter_name || null,
            };
        });
        res.json(pets);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Failed to fetch pets' });
    }
});

// GET single pet
app.get('/api/pets/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
                p.*,
                u.name AS owner_name,
                u.role AS owner_role,
                u.shelter_name AS owner_shelter_name
             FROM pets p
             LEFT JOIN users u ON p.owner_user_id = u.id
             WHERE p.id = ?`,
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Pet not found' });
        }
        const {
            owner_user_id,
            owner_name,
            owner_role,
            owner_shelter_name,
            ...rest
        } = rows[0];

        const pet = {
            ...rest,
            personality: typeof rest.personality === 'string' ? JSON.parse(rest.personality) : rest.personality,
            ownerUserId: owner_user_id || null,
            ownerName: owner_name || null,
            ownerRole: owner_role || null,
            ownerShelterName: owner_shelter_name || null,
        };
        res.json(pet);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Failed to fetch pet' });
    }
});

// POST create pet (adopter/shelter/admin)
app.post('/api/pets', authenticateToken, requirePetManager, async (req, res) => {
    try {
        const { name, breed, age, personality, image, description, ownerUserId } = req.body;
        let resolvedOwnerUserId = ['adopter', 'shelter'].includes(req.user.role) ? req.user.id : null;

        if (!name || !breed || !age || !image || !description) {
            return res.status(400).json({ error: 'Name, breed, age, image, and description are required' });
        }

        if (req.user.role === 'admin' && ownerUserId !== undefined && ownerUserId !== null && ownerUserId !== '') {
            const parsedOwnerId = Number(ownerUserId);
            if (!Number.isInteger(parsedOwnerId) || parsedOwnerId <= 0) {
                return res.status(400).json({ error: 'ownerUserId must be a valid user id' });
            }

            const [ownerRows] = await pool.query('SELECT id FROM users WHERE id = ? AND role IN ("adopter", "shelter")', [parsedOwnerId]);
            if (ownerRows.length === 0) {
                return res.status(400).json({ error: 'ownerUserId must reference an existing adopter or shelter account' });
            }

            resolvedOwnerUserId = parsedOwnerId;
        }

        const tags = Array.isArray(personality)
            ? personality.map((tag) => String(tag).trim()).filter(Boolean)
            : [];

        if (tags.length === 0) {
            return res.status(400).json({ error: 'At least one personality tag is required' });
        }

        const [result] = await pool.query(
            'INSERT INTO pets (name, breed, age, personality, image, description, owner_user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name.trim(), breed.trim(), age.trim(), JSON.stringify(tags), image.trim(), description.trim(), resolvedOwnerUserId]
        );

        res.status(201).json({ message: 'Pet created successfully', id: result.insertId });
    } catch (err) {
        console.error('Create pet error:', err.message);
        res.status(500).json({ error: 'Failed to create pet' });
    }
});

// PUT update pet (adopter/shelter/admin)
app.put('/api/pets/:id', authenticateToken, requirePetManager, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, breed, age, personality, image, description, ownerUserId } = req.body;
        let resolvedOwnerUserId = ['adopter', 'shelter'].includes(req.user.role) ? req.user.id : null;

        if (!name || !breed || !age || !image || !description) {
            return res.status(400).json({ error: 'Name, breed, age, image, and description are required' });
        }

        const [petRows] = await pool.query('SELECT id, owner_user_id FROM pets WHERE id = ?', [id]);
        if (petRows.length === 0) {
            return res.status(404).json({ error: 'Pet not found' });
        }

        if (req.user.role !== 'admin' && Number(petRows[0].owner_user_id) !== Number(req.user.id)) {
            return res.status(403).json({ error: 'You can only update your own pet listings' });
        }

        if (req.user.role === 'admin') {
            if (ownerUserId === '' || ownerUserId === null || ownerUserId === undefined) {
                resolvedOwnerUserId = null;
            } else {
                const parsedOwnerId = Number(ownerUserId);
                if (!Number.isInteger(parsedOwnerId) || parsedOwnerId <= 0) {
                    return res.status(400).json({ error: 'ownerUserId must be a valid user id' });
                }

                const [ownerRows] = await pool.query('SELECT id FROM users WHERE id = ? AND role IN ("adopter", "shelter")', [parsedOwnerId]);
                if (ownerRows.length === 0) {
                    return res.status(400).json({ error: 'ownerUserId must reference an existing adopter or shelter account' });
                }

                resolvedOwnerUserId = parsedOwnerId;
            }
        }

        const tags = Array.isArray(personality)
            ? personality.map((tag) => String(tag).trim()).filter(Boolean)
            : [];

        if (tags.length === 0) {
            return res.status(400).json({ error: 'At least one personality tag is required' });
        }

        const [result] = await pool.query(
            `UPDATE pets
             SET name = ?, breed = ?, age = ?, personality = ?, image = ?, description = ?, owner_user_id = ?
             WHERE id = ?`,
            [name.trim(), breed.trim(), age.trim(), JSON.stringify(tags), image.trim(), description.trim(), resolvedOwnerUserId, id]
        );

        res.json({ message: 'Pet updated successfully' });
    } catch (err) {
        console.error('Update pet error:', err.message);
        res.status(500).json({ error: 'Failed to update pet' });
    }
});

// DELETE pet (adopter/shelter/admin)
app.delete('/api/pets/:id', authenticateToken, requirePetManager, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'admin') {
            const [petRows] = await pool.query('SELECT id, owner_user_id FROM pets WHERE id = ?', [id]);
            if (petRows.length === 0) {
                return res.status(404).json({ error: 'Pet not found' });
            }

            if (Number(petRows[0].owner_user_id) !== Number(req.user.id)) {
                return res.status(403).json({ error: 'You can only delete your own pet listings' });
            }
        }

        const [result] = await pool.query('DELETE FROM pets WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pet not found' });
        }

        res.json({ message: 'Pet deleted successfully' });
    } catch (err) {
        console.error('Delete pet error:', err.message);
        res.status(500).json({ error: 'Failed to delete pet' });
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
