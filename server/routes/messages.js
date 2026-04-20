const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'aurelia_secret_key_2024';
const TYPING_TTL_MS = 5000;
const ONLINE_WINDOW_MS = 45000;

let schemaInitialized = false;
let schemaInitPromise = null;

const supportPresence = {
    adminLastSeenAt: 0,
    adminTypingByThread: new Map(),
    userPresenceByThread: new Map(),
};

function cleanupPresenceState() {
    const now = Date.now();

    for (const [threadId, typingUntil] of supportPresence.adminTypingByThread.entries()) {
        if (typingUntil <= now) {
            supportPresence.adminTypingByThread.delete(threadId);
        }
    }

    for (const [threadId, state] of supportPresence.userPresenceByThread.entries()) {
        if (!state) {
            supportPresence.userPresenceByThread.delete(threadId);
            continue;
        }

        if (state.typingUntil && state.typingUntil <= now) {
            state.typingUntil = 0;
        }

        const isStale = !state.lastSeenAt || now - state.lastSeenAt > ONLINE_WINDOW_MS * 8;
        if (isStale && !state.typingUntil) {
            supportPresence.userPresenceByThread.delete(threadId);
        }
    }
}

function markAdminSeen() {
    supportPresence.adminLastSeenAt = Date.now();
}

function markAdminTyping(threadId, isTyping) {
    if (isTyping) {
        supportPresence.adminTypingByThread.set(Number(threadId), Date.now() + TYPING_TTL_MS);
    } else {
        supportPresence.adminTypingByThread.delete(Number(threadId));
    }
}

function markUserSeen(threadId, userId) {
    const existing = supportPresence.userPresenceByThread.get(Number(threadId)) || {};
    supportPresence.userPresenceByThread.set(Number(threadId), {
        ...existing,
        userId: Number(userId),
        lastSeenAt: Date.now(),
    });
}

function markUserTyping(threadId, userId, isTyping) {
    const existing = supportPresence.userPresenceByThread.get(Number(threadId)) || {};
    supportPresence.userPresenceByThread.set(Number(threadId), {
        ...existing,
        userId: Number(userId),
        lastSeenAt: existing.lastSeenAt || Date.now(),
        typingUntil: isTyping ? Date.now() + TYPING_TTL_MS : 0,
    });
}

function getSupportPresenceForUser(threadId) {
    cleanupPresenceState();
    const now = Date.now();

    return {
        adminOnline: !!supportPresence.adminLastSeenAt && now - supportPresence.adminLastSeenAt <= ONLINE_WINDOW_MS,
        adminTyping: (supportPresence.adminTypingByThread.get(Number(threadId)) || 0) > now,
    };
}

function getSupportPresenceForAdmin(threadId, expectedUserId) {
    cleanupPresenceState();
    const now = Date.now();
    const state = supportPresence.userPresenceByThread.get(Number(threadId));
    const userIdMatches = state && Number(state.userId) === Number(expectedUserId);

    return {
        userOnline: !!(userIdMatches && state.lastSeenAt && now - state.lastSeenAt <= ONLINE_WINDOW_MS),
        userTyping: !!(userIdMatches && state.typingUntil && state.typingUntil > now),
    };
}

async function ensureMessagingSchema() {
    if (schemaInitialized) return;

    if (!schemaInitPromise) {
        schemaInitPromise = (async () => {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS support_threads (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_user_thread (user_id),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS support_messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    thread_id INT NOT NULL,
                    sender_role ENUM('adopter', 'shelter', 'admin') NOT NULL,
                    sender_user_id INT NULL,
                    message TEXT NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (thread_id) REFERENCES support_threads(id) ON DELETE CASCADE,
                    FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE SET NULL
                )
            `);

            try {
                await pool.query('ALTER TABLE pets ADD COLUMN owner_user_id INT NULL');
            } catch (err) {
                if (err.code !== 'ER_DUP_FIELDNAME') {
                    throw err;
                }
            }

            await pool.query(`
                CREATE TABLE IF NOT EXISTS direct_threads (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    pet_id INT NOT NULL,
                    owner_user_id INT NOT NULL,
                    participant_user_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_pet_chat (pet_id, owner_user_id, participant_user_id),
                    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
                    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (participant_user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS direct_messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    thread_id INT NOT NULL,
                    sender_user_id INT NOT NULL,
                    message TEXT NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (thread_id) REFERENCES direct_threads(id) ON DELETE CASCADE,
                    FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);

            schemaInitialized = true;
        })();
    }

    try {
        await schemaInitPromise;
    } catch (err) {
        schemaInitPromise = null;
        throw err;
    }
}

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

async function attachCurrentUser(req, res, next) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Invalid session. Please sign in again.' });
        }

        // Keep built-in admin token support without requiring a DB user row.
        if (req.user.role === 'admin' && Number(req.user.id) === 0) {
            req.currentUser = { id: 0, role: 'admin' };
            return next();
        }

        const [rows] = await pool.query('SELECT id, role FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Session is no longer valid. Please sign in again.' });
        }

        req.currentUser = { id: rows[0].id, role: rows[0].role };
        next();
    } catch (err) {
        console.error('Attach current user error:', err.message);
        res.status(500).json({ error: 'Authentication check failed' });
    }
}

function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

function requireUserOrShelter(req, res, next) {
    const role = req.currentUser?.role || req.user?.role;

    if (!role || !['adopter', 'shelter'].includes(role)) {
        return res.status(403).json({ error: 'Adopter or shelter access required' });
    }
    next();
}

function requireDirectChatUser(req, res, next) {
    const role = req.currentUser?.role || req.user?.role;

    if (!role || !['adopter', 'shelter'].includes(role)) {
        return res.status(403).json({ error: 'Only adopter and shelter users can use direct chat' });
    }
    next();
}

async function ensureSchema(res) {
    try {
        await ensureMessagingSchema();
        return true;
    } catch (err) {
        console.error('Messaging schema init error:', err.message);
        res.status(500).json({ error: 'Messaging service is unavailable' });
        return false;
    }
}

async function getOrCreateThreadForUser(userId) {
    const [existing] = await pool.query('SELECT id FROM support_threads WHERE user_id = ?', [userId]);

    if (existing.length > 0) {
        return existing[0].id;
    }

    const [result] = await pool.query('INSERT INTO support_threads (user_id) VALUES (?)', [userId]);
    return result.insertId;
}

async function getThreadMessages(threadId) {
    const [messages] = await pool.query(
        `SELECT
            m.id,
            m.thread_id AS threadId,
            m.sender_role AS senderRole,
            m.sender_user_id AS senderUserId,
            m.message,
            m.is_read AS isRead,
            m.created_at AS createdAt,
            CASE
                WHEN m.sender_role = 'admin' THEN 'Administrator'
                ELSE u.name
            END AS senderName
         FROM support_messages m
         LEFT JOIN users u ON m.sender_user_id = u.id
         WHERE m.thread_id = ?
         ORDER BY m.created_at ASC, m.id ASC`,
        [threadId]
    );

    return messages;
}

async function getDirectThreadById(threadId) {
    const [rows] = await pool.query(
        `SELECT
            t.id,
            t.pet_id AS petId,
            t.owner_user_id AS ownerUserId,
            t.participant_user_id AS participantUserId,
            t.created_at AS createdAt,
            t.updated_at AS updatedAt,
            p.name AS petName,
            p.image AS petImage,
            p.breed AS petBreed,
            owner.name AS ownerName,
            participant.name AS participantName
         FROM direct_threads t
         JOIN pets p ON p.id = t.pet_id
         JOIN users owner ON owner.id = t.owner_user_id
         JOIN users participant ON participant.id = t.participant_user_id
         WHERE t.id = ?`,
        [threadId]
    );

    return rows[0] || null;
}

async function getDirectMessages(threadId) {
    const [rows] = await pool.query(
        `SELECT
            m.id,
            m.thread_id AS threadId,
            m.sender_user_id AS senderUserId,
            m.message,
            m.is_read AS isRead,
            m.created_at AS createdAt,
            u.name AS senderName
         FROM direct_messages m
         JOIN users u ON u.id = m.sender_user_id
         WHERE m.thread_id = ?
         ORDER BY m.created_at ASC, m.id ASC`,
        [threadId]
    );

    return rows;
}

router.get('/me', authenticateToken, attachCurrentUser, requireUserOrShelter, async (req, res) => {
    if (!(await ensureSchema(res))) return;

    try {
        const threadId = await getOrCreateThreadForUser(req.currentUser.id);
        const messages = await getThreadMessages(threadId);
        markUserSeen(threadId, req.currentUser.id);
        const presence = getSupportPresenceForUser(threadId);

        await pool.query(
            'UPDATE support_messages SET is_read = TRUE WHERE thread_id = ? AND sender_role = "admin" AND is_read = FALSE',
            [threadId]
        );

        res.json({ threadId, messages, presence });
    } catch (err) {
        console.error('Get user messages error:', err.message);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

router.post('/me/typing', authenticateToken, attachCurrentUser, requireUserOrShelter, async (req, res) => {
    if (!(await ensureSchema(res))) return;

    try {
        const requestedThreadId = req.body?.threadId;
        const isTyping = Boolean(req.body?.isTyping);
        let threadId = Number(requestedThreadId);

        if (!Number.isInteger(threadId) || threadId <= 0) {
            threadId = await getOrCreateThreadForUser(req.currentUser.id);
        }

        markUserSeen(threadId, req.currentUser.id);
        markUserTyping(threadId, req.currentUser.id, isTyping);

        res.json({ ok: true, threadId });
    } catch (err) {
        console.error('User typing update error:', err.message);
        res.status(500).json({ error: 'Failed to update typing state' });
    }
});

router.post('/me', authenticateToken, attachCurrentUser, requireUserOrShelter, async (req, res) => {
    if (!(await ensureSchema(res))) return;

    try {
        const message = String(req.body.message || '').trim();

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (message.length > 2000) {
            return res.status(400).json({ error: 'Message must be 2000 characters or less' });
        }

        const threadId = await getOrCreateThreadForUser(req.currentUser.id);
        markUserSeen(threadId, req.currentUser.id);
        markUserTyping(threadId, req.currentUser.id, false);

        const [result] = await pool.query(
            `INSERT INTO support_messages (thread_id, sender_role, sender_user_id, message)
             VALUES (?, ?, ?, ?)`,
            [threadId, req.currentUser.role, req.currentUser.id, message]
        );

        await pool.query('UPDATE support_threads SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [threadId]);

        res.status(201).json({
            id: result.insertId,
            threadId,
            senderRole: req.currentUser.role,
            senderUserId: req.currentUser.id,
            senderName: null,
            message,
            isRead: false,
            createdAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error('Send user message error:', err.message);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

router.get('/admin/threads', authenticateToken, requireAdmin, async (req, res) => {
    if (!(await ensureSchema(res))) return;

    try {
        markAdminSeen();
        const [threads] = await pool.query(
            `SELECT
                t.id AS threadId,
                t.user_id AS userId,
                t.created_at AS createdAt,
                t.updated_at AS updatedAt,
                u.name AS userName,
                u.email AS userEmail,
                u.role AS userRole,
                u.shelter_name AS shelterName,
                (
                    SELECT m2.message
                    FROM support_messages m2
                    WHERE m2.thread_id = t.id
                    ORDER BY m2.created_at DESC, m2.id DESC
                    LIMIT 1
                ) AS lastMessage,
                (
                    SELECT m2.created_at
                    FROM support_messages m2
                    WHERE m2.thread_id = t.id
                    ORDER BY m2.created_at DESC, m2.id DESC
                    LIMIT 1
                ) AS lastMessageAt,
                (
                    SELECT COUNT(*)
                    FROM support_messages m3
                    WHERE m3.thread_id = t.id
                      AND m3.sender_role IN ('adopter', 'shelter')
                      AND m3.is_read = FALSE
                ) AS unreadCount
             FROM support_threads t
             JOIN users u ON u.id = t.user_id
             ORDER BY COALESCE(lastMessageAt, t.updated_at) DESC`
        );

        res.json(threads);
    } catch (err) {
        console.error('Get admin threads error:', err.message);
        res.status(500).json({ error: 'Failed to fetch chat threads' });
    }
});

router.get('/admin/threads/:threadId', authenticateToken, requireAdmin, async (req, res) => {
    if (!(await ensureSchema(res))) return;

    try {
        markAdminSeen();
        const threadId = Number(req.params.threadId);

        if (!Number.isInteger(threadId) || threadId <= 0) {
            return res.status(400).json({ error: 'Invalid thread id' });
        }

        const [threadRows] = await pool.query(
            `SELECT
                t.id AS threadId,
                t.user_id AS userId,
                t.created_at AS createdAt,
                t.updated_at AS updatedAt,
                u.name AS userName,
                u.email AS userEmail,
                u.role AS userRole,
                u.shelter_name AS shelterName
             FROM support_threads t
             JOIN users u ON u.id = t.user_id
             WHERE t.id = ?`,
            [threadId]
        );

        if (threadRows.length === 0) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        const messages = await getThreadMessages(threadId);

        await pool.query(
            `UPDATE support_messages
             SET is_read = TRUE
             WHERE thread_id = ?
               AND sender_role IN ('adopter', 'shelter')
               AND is_read = FALSE`,
            [threadId]
        );

        const presence = getSupportPresenceForAdmin(threadId, threadRows[0].userId);
        res.json({ thread: threadRows[0], messages, presence });
    } catch (err) {
        console.error('Get admin thread detail error:', err.message);
        res.status(500).json({ error: 'Failed to fetch thread details' });
    }
});

router.post('/admin/threads/:threadId/typing', authenticateToken, requireAdmin, async (req, res) => {
    if (!(await ensureSchema(res))) return;

    try {
        markAdminSeen();
        const threadId = Number(req.params.threadId);
        const isTyping = Boolean(req.body?.isTyping);

        if (!Number.isInteger(threadId) || threadId <= 0) {
            return res.status(400).json({ error: 'Invalid thread id' });
        }

        const [threadRows] = await pool.query('SELECT id FROM support_threads WHERE id = ?', [threadId]);
        if (threadRows.length === 0) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        markAdminTyping(threadId, isTyping);
        res.json({ ok: true });
    } catch (err) {
        console.error('Admin typing update error:', err.message);
        res.status(500).json({ error: 'Failed to update typing state' });
    }
});

router.post('/admin/threads/:threadId', authenticateToken, requireAdmin, async (req, res) => {
    if (!(await ensureSchema(res))) return;

    try {
        markAdminSeen();
        const threadId = Number(req.params.threadId);
        const message = String(req.body.message || '').trim();

        if (!Number.isInteger(threadId) || threadId <= 0) {
            return res.status(400).json({ error: 'Invalid thread id' });
        }

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (message.length > 2000) {
            return res.status(400).json({ error: 'Message must be 2000 characters or less' });
        }

        const [threadRows] = await pool.query('SELECT id FROM support_threads WHERE id = ?', [threadId]);
        if (threadRows.length === 0) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        const [result] = await pool.query(
            `INSERT INTO support_messages (thread_id, sender_role, sender_user_id, message)
             VALUES (?, 'admin', NULL, ?)`,
            [threadId, message]
        );

        markAdminTyping(threadId, false);

        await pool.query('UPDATE support_threads SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [threadId]);

        res.status(201).json({
            id: result.insertId,
            threadId,
            senderRole: 'admin',
            senderUserId: null,
            senderName: 'Administrator',
            message,
            isRead: false,
            createdAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error('Send admin message error:', err.message);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

router.post('/direct/start', authenticateToken, attachCurrentUser, requireDirectChatUser, async (req, res) => {
    if (!(await ensureSchema(res))) return;

    try {
        const petId = Number(req.body.petId);

        if (!Number.isInteger(petId) || petId <= 0) {
            return res.status(400).json({ error: 'Valid petId is required' });
        }

        const [petRows] = await pool.query(
            'SELECT id, name, owner_user_id FROM pets WHERE id = ?',
            [petId]
        );

        if (petRows.length === 0) {
            return res.status(404).json({ error: 'Pet not found' });
        }

        const pet = petRows[0];
        const ownerUserId = Number(pet.owner_user_id);

        if (!ownerUserId) {
            return res.status(400).json({ error: 'This pet does not have a registered owner yet' });
        }

        if (ownerUserId === Number(req.currentUser.id)) {
            return res.status(400).json({ error: 'You cannot start a direct chat with yourself' });
        }

        const participantUserId = Number(req.currentUser.id);
        const [existing] = await pool.query(
            `SELECT id
             FROM direct_threads
             WHERE pet_id = ? AND owner_user_id = ? AND participant_user_id = ?`,
            [petId, ownerUserId, participantUserId]
        );

        let threadId;

        if (existing.length > 0) {
            threadId = existing[0].id;
        } else {
            const [result] = await pool.query(
                `INSERT INTO direct_threads (pet_id, owner_user_id, participant_user_id)
                 VALUES (?, ?, ?)`,
                [petId, ownerUserId, participantUserId]
            );
            threadId = result.insertId;
        }

        res.json({ threadId });
    } catch (err) {
        console.error('Start direct chat error:', err.message);
        res.status(500).json({ error: 'Failed to start chat with owner' });
    }
});

router.get('/direct/threads', authenticateToken, attachCurrentUser, requireDirectChatUser, async (req, res) => {
    if (!(await ensureSchema(res))) return;

    try {
        const currentUserId = Number(req.currentUser.id);

        const [rows] = await pool.query(
            `SELECT
                t.id AS threadId,
                t.pet_id AS petId,
                t.owner_user_id AS ownerUserId,
                t.participant_user_id AS participantUserId,
                t.created_at AS createdAt,
                t.updated_at AS updatedAt,
                p.name AS petName,
                p.image AS petImage,
                p.breed AS petBreed,
                CASE
                    WHEN t.owner_user_id = ? THEN participant.id
                    ELSE owner.id
                END AS otherUserId,
                CASE
                    WHEN t.owner_user_id = ? THEN participant.name
                    ELSE owner.name
                END AS otherUserName,
                CASE
                    WHEN t.owner_user_id = ? THEN participant.role
                    ELSE owner.role
                END AS otherUserRole,
                (
                    SELECT dm2.message
                    FROM direct_messages dm2
                    WHERE dm2.thread_id = t.id
                    ORDER BY dm2.created_at DESC, dm2.id DESC
                    LIMIT 1
                ) AS lastMessage,
                (
                    SELECT dm2.created_at
                    FROM direct_messages dm2
                    WHERE dm2.thread_id = t.id
                    ORDER BY dm2.created_at DESC, dm2.id DESC
                    LIMIT 1
                ) AS lastMessageAt,
                (
                    SELECT COUNT(*)
                    FROM direct_messages dm3
                    WHERE dm3.thread_id = t.id
                      AND dm3.sender_user_id != ?
                      AND dm3.is_read = FALSE
                ) AS unreadCount
             FROM direct_threads t
             JOIN pets p ON p.id = t.pet_id
             JOIN users owner ON owner.id = t.owner_user_id
             JOIN users participant ON participant.id = t.participant_user_id
             WHERE t.owner_user_id = ? OR t.participant_user_id = ?
             ORDER BY COALESCE(lastMessageAt, t.updated_at) DESC`,
            [
                currentUserId,
                currentUserId,
                currentUserId,
                currentUserId,
                currentUserId,
                currentUserId,
            ]
        );

        res.json(rows);
    } catch (err) {
        console.error('List direct threads error:', err.message);
        res.status(500).json({ error: 'Failed to fetch direct chat threads' });
    }
});

router.get('/direct/threads/:threadId', authenticateToken, attachCurrentUser, requireDirectChatUser, async (req, res) => {
    if (!(await ensureSchema(res))) return;

    try {
        const threadId = Number(req.params.threadId);
        const currentUserId = Number(req.currentUser.id);

        if (!Number.isInteger(threadId) || threadId <= 0) {
            return res.status(400).json({ error: 'Invalid thread id' });
        }

        const thread = await getDirectThreadById(threadId);

        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        if (![thread.ownerUserId, thread.participantUserId].includes(currentUserId)) {
            return res.status(403).json({ error: 'Access denied for this thread' });
        }

        const messages = await getDirectMessages(threadId);

        await pool.query(
            `UPDATE direct_messages
             SET is_read = TRUE
             WHERE thread_id = ?
               AND sender_user_id != ?
               AND is_read = FALSE`,
            [threadId, currentUserId]
        );

        res.json({ thread, messages });
    } catch (err) {
        console.error('Get direct thread error:', err.message);
        res.status(500).json({ error: 'Failed to fetch chat thread' });
    }
});

router.post('/direct/threads/:threadId', authenticateToken, attachCurrentUser, requireDirectChatUser, async (req, res) => {
    if (!(await ensureSchema(res))) return;

    try {
        const threadId = Number(req.params.threadId);
        const currentUserId = Number(req.currentUser.id);
        const message = String(req.body.message || '').trim();

        if (!Number.isInteger(threadId) || threadId <= 0) {
            return res.status(400).json({ error: 'Invalid thread id' });
        }

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (message.length > 2000) {
            return res.status(400).json({ error: 'Message must be 2000 characters or less' });
        }

        const thread = await getDirectThreadById(threadId);
        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        if (![thread.ownerUserId, thread.participantUserId].includes(currentUserId)) {
            return res.status(403).json({ error: 'Access denied for this thread' });
        }

        const [result] = await pool.query(
            `INSERT INTO direct_messages (thread_id, sender_user_id, message)
             VALUES (?, ?, ?)`,
            [threadId, currentUserId, message]
        );

        await pool.query('UPDATE direct_threads SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [threadId]);

        res.status(201).json({
            id: result.insertId,
            threadId,
            senderUserId: currentUserId,
            message,
            isRead: false,
            createdAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error('Send direct message error:', err.message);
        res.status(500).json({ error: 'Failed to send direct message' });
    }
});

module.exports = router;
