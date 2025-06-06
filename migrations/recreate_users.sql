-- Drop existing users table
DROP TABLE IF EXISTS users CASCADE;

-- Recreate users table with correct structure
CREATE TABLE users (
    id VARCHAR PRIMARY KEY NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    role VARCHAR NOT NULL DEFAULT 'public',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verification_token VARCHAR,
    verification_token_expiry TIMESTAMP,
    reset_token VARCHAR,
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert test users
INSERT INTO users (id, email, password, first_name, last_name, role, is_verified) VALUES
('user-001', 'public@example.com', 'public123', 'John', 'Public', 'public', true),
('user-002', 'health@example.com', 'health123', 'Sarah', 'Health', 'health_worker', true),
('user-003', 'registrar@example.com', 'registrar123', 'Michael', 'Registrar', 'registrar', true),
('user-004', 'admin@example.com', 'admin123', 'Alice', 'Admin', 'admin', true),
('user-005', 'isaacaddyasare@gmail.com', 'Zavi1255@', 'isaac', 'addy', 'admin', true); 