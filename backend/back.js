// backend.js
const { Pool } = require('pg');

// 1. Setup the PostgreSQL connection
const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'serenely',
    password: 'password',
    port: 5432,
});

// 2. Define the schema in a simple way
async function setupDatabase() {
    try {
        const client = await pool.connect();

        // Create the users table with a unique public_id for messaging
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        public_id VARCHAR(8) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Create the conversations table to link two users
        await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user1_id INTEGER NOT NULL REFERENCES users(id),
        user2_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Create the messages table to store chat history
        await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES conversations(id),
        sender_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        tone_score FLOAT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('Database tables are set up. 🚀');
        client.release();
    } catch (err) {
        console.error('Error setting up the database:', err.stack);
    }
}

// 3. Export the query function to interact with the database
module.exports = {
    query: (text, params) => pool.query(text, params),
    setupDatabase,
};

// Call the function to set up tables when the script runs
setupDatabase();
