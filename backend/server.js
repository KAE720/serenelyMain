// backend/server.js
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
    user: process.env.DB_USER || 'your_username',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'serene_app',
    password: process.env.DB_PASSWORD || 'your_password',
    port: process.env.DB_PORT || 5432,
});

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secure_secret_key';

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

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

// Routes

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Serene API is running' });
});

// User registration
app.post('/auth/register', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate unique SerenID
        const serenId = 'SRN' + Math.random().toString(36).substr(2, 8).toUpperCase();

        // Create user
        const newUser = await pool.query(
            'INSERT INTO users (email, password_hash, full_name, seren_id, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, full_name, seren_id',
            [email, hashedPassword, fullName, serenId]
        );

        const user = newUser.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                serenId: user.seren_id
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User login
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const userResult = await pool.query(
            'SELECT id, email, password_hash, full_name, seren_id FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = userResult.rows[0];

        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                serenId: user.seren_id
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user conversations
app.get('/conversations', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const conversations = await pool.query(`
      SELECT
        c.id,
        c.created_at,
        CASE
          WHEN c.user1_id = $1 THEN u2.full_name
          ELSE u1.full_name
        END as partner_name,
        CASE
          WHEN c.user1_id = $1 THEN c.user2_id
          ELSE c.user1_id
        END as partner_id,
        m.content as last_message,
        m.created_at as last_message_time,
        m.tone as last_message_tone
      FROM conversations c
      JOIN users u1 ON c.user1_id = u1.id
      JOIN users u2 ON c.user2_id = u2.id
      LEFT JOIN LATERAL (
        SELECT content, created_at, tone
        FROM messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
      ) m ON true
      WHERE c.user1_id = $1 OR c.user2_id = $1
      ORDER BY COALESCE(m.created_at, c.created_at) DESC
    `, [userId]);

        res.json(conversations.rows);

    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get messages for a conversation
app.get('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.userId;

        // Verify user is part of the conversation
        const conversation = await pool.query(
            'SELECT id FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
            [conversationId, userId]
        );

        if (conversation.rows.length === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const messages = await pool.query(
            'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
            [conversationId]
        );

        res.json(messages.rows);

    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Send a message
app.post('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { content, tone, toneConfidence } = req.body;
        const userId = req.user.userId;

        // Verify user is part of the conversation
        const conversation = await pool.query(
            'SELECT id FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
            [conversationId, userId]
        );

        if (conversation.rows.length === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Insert message
        const newMessage = await pool.query(
            'INSERT INTO messages (conversation_id, sender_id, content, tone, tone_confidence, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
            [conversationId, userId, content, tone, toneConfidence]
        );

        res.status(201).json(newMessage.rows[0]);

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start conversation with another user
app.post('/conversations', authenticateToken, async (req, res) => {
    try {
        const { partnerSerenId } = req.body;
        const userId = req.user.userId;

        // Find partner by SerenID
        const partner = await pool.query(
            'SELECT id FROM users WHERE seren_id = $1',
            [partnerSerenId]
        );

        if (partner.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const partnerId = partner.rows[0].id;

        // Check if conversation already exists
        const existingConversation = await pool.query(
            'SELECT id FROM conversations WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)',
            [userId, partnerId]
        );

        if (existingConversation.rows.length > 0) {
            return res.status(400).json({ error: 'Conversation already exists' });
        }

        // Create new conversation
        const newConversation = await pool.query(
            'INSERT INTO conversations (user1_id, user2_id, created_at) VALUES ($1, $2, NOW()) RETURNING *',
            [userId, partnerId]
        );

        res.status(201).json(newConversation.rows[0]);

    } catch (error) {
        console.error('Create conversation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Serene API server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
