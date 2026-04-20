const express = require('express');
const router = express.Router();
const pool = require('../db');

// Middleware to verify JWT token (reuse from            auth routes)
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'aurelia_secret_key_2024';

// Status validation utilities
const STATUS_TRANSITIONS = {
    pending: ['under_review', 'withdrawn'],
    under_review: ['approved', 'rejected', 'pending', 'withdrawn'],
    approved: ['completed', 'rejected'],
    rejected: [],
    completed: [],
    withdrawn: []
};

function isValidStatusTransition(currentStatus, newStatus) {
    if (!STATUS_TRANSITIONS[currentStatus]) return false;
    return STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// POST /api/adoptions/apply - Submit adoption application
router.post('/apply', authenticateToken, async (req, res) => {
    try {
        const {
            petId,
            homeType,
            homeOwnership,
            hasYard,
            yardFenced,
            hasOtherPets,
            otherPetsDetails,
            hasChildren,
            childrenAges,
            petExperience,
            previousPets,
            vetReference,
            vetPhone,
            personalReferenceName,
            personalReferencePhone,
            personalReferenceRelationship,
            reasonForAdoption,
            specialAccommodations,
            hoursAlonePerDay,
            exercisePlan,
            emergencyContactName,
            emergencyContactPhone
        } = req.body;

        const adopterId = req.user.id;

        // Basic validation
        if (!petId || !homeType || !homeOwnership || !petExperience || !reasonForAdoption) {
            return res.status(400).json({ 
                error: 'Missing required fields: petId, homeType, homeOwnership, petExperience, and reasonForAdoption are required' 
            });
        }

        // Verify pet exists and prevent owners from adopting their own listings
        const [petRows] = await pool.query('SELECT id, owner_user_id FROM pets WHERE id = ?', [petId]);
        if (petRows.length === 0) {
            return res.status(404).json({ error: 'Pet not found' });
        }

        if (Number(petRows[0].owner_user_id) === Number(adopterId)) {
            return res.status(403).json({ error: 'You cannot adopt your own pet listing' });
        }

        // Check if user already has a pending/approved application for this pet
        const [existingApps] = await pool.query(
            'SELECT * FROM adoption_applications WHERE pet_id = ? AND adopter_id = ? AND status IN ("pending", "under_review", "approved")',
            [petId, adopterId]
        );

        if (existingApps.length > 0) {
            return res.status(400).json({ error: 'You already have an active application for this pet' });
        }

        // Insert application
        const [result] = await pool.query(
            `INSERT INTO adoption_applications (
                pet_id, adopter_id, home_type, home_ownership, has_yard, yard_fenced,
                has_other_pets, other_pets_details, has_children, children_ages,
                pet_experience, previous_pets, vet_reference, vet_phone,
                personal_reference_name, personal_reference_phone, personal_reference_relationship,
                reason_for_adoption, special_accommodations, hours_alone_per_day,
                exercise_plan, emergency_contact_name, emergency_contact_phone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                petId, adopterId, homeType, homeOwnership, hasYard, yardFenced,
                hasOtherPets, otherPetsDetails, hasChildren, childrenAges,
                petExperience, previousPets, vetReference, vetPhone,
                personalReferenceName, personalReferencePhone, personalReferenceRelationship,
                reasonForAdoption, specialAccommodations, hoursAlonePerDay,
                exercisePlan, emergencyContactName, emergencyContactPhone
            ]
        );

        // Log initial status in history
        await pool.query(
            'INSERT INTO application_status_history (application_id, new_status, changed_by, notes) VALUES (?, ?, ?, ?)',
            [result.insertId, 'pending', adopterId, 'Application submitted']
        );

        res.status(201).json({
            message: 'Application submitted successfully',
            applicationId: result.insertId
        });
    } catch (err) {
        console.error('Apply error:', err.message);
        console.error('Stack:', err.stack);
        res.status(500).json({ error: 'Failed to submit application: ' + err.message });
    }
});

// GET /api/adoptions/user/:userId - Get user's applications
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        // Users can only view their own applications unless they're shelter
        if (req.user.id !== parseInt(userId) && req.user.role !== 'shelter') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const [rows] = await pool.query(
            `SELECT 
                a.*,
                p.name as pet_name,
                p.breed as pet_breed,
                p.image as pet_image,
                p.age as pet_age
            FROM adoption_applications a
            JOIN pets p ON a.pet_id = p.id
            WHERE a.adopter_id = ?
            ORDER BY a.created_at DESC`,
            [userId]
        );

        res.json(rows);
    } catch (err) {
        console.error('Get user applications error:', err.message);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// GET /api/adoptions/:id - Get single application details
router.get('/:id(\\d+)', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const [appRows] = await pool.query(
            `SELECT 
                a.*,
                p.name as pet_name,
                p.breed as pet_breed,
                p.image as pet_image,
                p.age as pet_age,
                p.description as pet_description,
                u.name as adopter_name,
                u.email as adopter_email,
                u.phone as adopter_phone
            FROM adoption_applications a
            JOIN pets p ON a.pet_id = p.id
            JOIN users u ON a.adopter_id = u.id
            WHERE a.id = ?`,
            [id]
        );

        if (appRows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const application = appRows[0];

        // Check access rights
        if (req.user.role !== 'shelter' && req.user.id !== application.adopter_id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Get status history
        const [historyRows] = await pool.query(
            `SELECT 
                h.*,
                u.name as changed_by_name
            FROM application_status_history h
            JOIN users u ON h.changed_by = u.id
            WHERE h.application_id = ?
            ORDER BY h.changed_at DESC`,
            [id]
        );

        application.history = historyRows;

        res.json(application);
    } catch (err) {
        console.error('Get application error:', err.message);
        res.status(500).json({ error: 'Failed to fetch application' });
    }
});

// GET /api/adoptions/pet/:petId - Get all applications for a pet (shelter only)
router.get('/pet/:petId', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'shelter') {
            return res.status(403).json({ error: 'Access denied - shelters only' });
        }

        const { petId } = req.params;

        const [rows] = await pool.query(
            `SELECT 
                a.*,
                u.name as adopter_name,
                u.email as adopter_email,
                u.phone as adopter_phone
            FROM adoption_applications a
            JOIN users u ON a.adopter_id = u.id
            WHERE a.pet_id = ?
            ORDER BY 
                CASE a.status
                    WHEN 'pending' THEN 1
                    WHEN 'under_review' THEN 2
                    WHEN 'approved' THEN 3
                    WHEN 'rejected' THEN 4
                    WHEN 'completed' THEN 5
                    WHEN 'withdrawn' THEN 6
                END,
                a.created_at DESC`,
            [petId]
        );

        res.json(rows);
    } catch (err) {
        console.error('Get pet applications error:', err.message);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// GET /api/adoptions/shelter/pending - Get all pending applications (shelter only)
router.get('/shelter/pending', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'shelter') {
            return res.status(403).json({ error: 'Access denied - shelters only' });
        }

        const [rows] = await pool.query(
            `SELECT 
                a.*,
                p.name as pet_name,
                p.breed as pet_breed,
                p.image as pet_image,
                u.name as adopter_name,
                u.email as adopter_email
            FROM adoption_applications a
            JOIN pets p ON a.pet_id = p.id
            JOIN users u ON a.adopter_id = u.id
            WHERE a.status IN ('pending', 'under_review')
            ORDER BY a.created_at ASC`
        );

        res.json(rows);
    } catch (err) {
        console.error('Get pending applications error:', err.message);
        res.status(500).json({ error: 'Failed to fetch pending applications' });
    }
});

// PATCH /api/adoptions/:id/status - Update application status (shelter only)
router.patch('/:id(\\d+)/status', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'shelter') {
            return res.status(403).json({ error: 'Access denied - shelters only' });
        }

        const { id } = req.params;
        const { status, notes } = req.body;

        // Validate status
        const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'completed', 'withdrawn'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Get current application
        const [appRows] = await pool.query('SELECT * FROM adoption_applications WHERE id = ?', [id]);
        if (appRows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const oldStatus = appRows[0].status;

        // Validate status transition
        if (!isValidStatusTransition(oldStatus, status)) {
            return res.status(400).json({ 
                error: `Invalid status transition from ${oldStatus} to ${status}`,
                validTransitions: STATUS_TRANSITIONS[oldStatus]
            });
        }

        // Update application status
        await pool.query(
            'UPDATE adoption_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );

        // Log status change
        await pool.query(
            'INSERT INTO application_status_history (application_id, old_status, new_status, changed_by, notes) VALUES (?, ?, ?, ?, ?)',
            [id, oldStatus, status, req.user.id, notes || null]
        );

        res.json({ message: 'Application status updated successfully' });
    } catch (err) {
        console.error('Update status error:', err.message);
        res.status(500).json({ error: 'Failed to update application status' });
    }
});

// DELETE /api/adoptions/:id - Withdraw application (adopter only, only pending/under_review)
router.delete('/:id(\\d+)', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Get application
        const [appRows] = await pool.query('SELECT * FROM adoption_applications WHERE id = ?', [id]);
        if (appRows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const application = appRows[0];

        // Check if user owns this application
        if (req.user.id !== application.adopter_id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Can only withdraw pending or under_review applications
        if (!['pending', 'under_review'].includes(application.status)) {
            return res.status(400).json({ error: 'Can only withdraw pending or under review applications' });
        }

        // Update to withdrawn status
        await pool.query(
            'UPDATE adoption_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['withdrawn', id]
        );

        // Log withdrawal
        await pool.query(
            'INSERT INTO application_status_history (application_id, old_status, new_status, changed_by, notes) VALUES (?, ?, ?, ?, ?)',
            [id, application.status, 'withdrawn', req.user.id, 'Application withdrawn by applicant']
        );

        res.json({ message: 'Application withdrawn successfully' });
    } catch (err) {
        console.error('Withdraw application error:', err.message);
        res.status(500).json({ error: 'Failed to withdraw application' });
    }
});

// GET /api/adoptions/shelter/all - Get all applications (shelter dashboard)
router.get('/shelter/all', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'shelter') {
            return res.status(403).json({ error: 'Access denied - shelters only' });
        }

        const [rows] = await pool.query(
            `SELECT 
                a.*,
                p.name as pet_name,
                p.breed as pet_breed,
                p.image as pet_image,
                u.name as adopter_name,
                u.email as adopter_email
            FROM adoption_applications a
            JOIN pets p ON a.pet_id = p.id
            JOIN users u ON a.adopter_id = u.id
            ORDER BY a.created_at DESC`
        );

        res.json(rows);
    } catch (err) {
        console.error('Get all applications error:', err.message);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

module.exports = router;
