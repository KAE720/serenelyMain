-- database/schema.sql
-- Serene App Database Schema

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL for Google/Apple auth users
    full_name VARCHAR(255) NOT NULL,
    seren_id VARCHAR(20) UNIQUE NOT NULL, -- Public ID like "SRN12ABC34"
    google_id VARCHAR(255) UNIQUE, -- For Google Auth
    apple_id VARCHAR(255) UNIQUE, -- For Apple Auth
    profile_picture_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure unique conversations between two users
    CONSTRAINT unique_conversation UNIQUE(LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id))
);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    tone VARCHAR(50), -- positive, negative, neutral, excited, sad, angry, supportive, stressed, etc.
    tone_confidence DECIMAL(3,2), -- 0.00 to 1.00
    tone_explanation TEXT, -- AI-generated explanation of the tone
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_users_seren_id ON users(seren_id);
CREATE INDEX idx_users_email ON users(email);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (remove in production)
INSERT INTO users (email, full_name, seren_id, google_id) VALUES
('sarah.johnson@example.com', 'Sarah Johnson', 'SRN12ABC34', 'google_123456'),
('mike.chen@example.com', 'Mike Chen', 'SRN56DEF78', 'google_789012'),
('alex.rivera@example.com', 'Alex Rivera', 'SRN90GHI12', NULL);

-- Create a test conversation
INSERT INTO conversations (user1_id, user2_id) VALUES (1, 2);

-- Add some test messages
INSERT INTO messages (conversation_id, sender_id, content, tone, tone_confidence, tone_explanation) VALUES
(1, 1, 'Hey, how are you doing today?', 'positive', 0.85, 'This message has a positive, caring tone that shows genuine interest in the other person\'s wellbeing'),
(1, 2, 'I\'m feeling a bit stressed about work lately.', 'stressed', 0.78, 'This message expresses stress and anxiety, indicating the sender is dealing with workplace pressure'),
(1, 1, 'I\'m sorry to hear that. Want to talk about it?', 'supportive', 0.92, 'This message shows empathy and offers emotional support, creating a safe space for further discussion');
