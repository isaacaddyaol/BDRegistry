-- Ghana Birth and Death Registration System Database Schema
-- This schema matches the Drizzle ORM definitions in shared/schema.ts

-- Enable UUID extension (if needed)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Session storage table - required for Replit Auth
CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- Create index on expire column for session cleanup
CREATE INDEX IDX_session_expire ON sessions(expire);

-- User storage table - required for Replit Auth
CREATE TABLE users (
    id VARCHAR PRIMARY KEY NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    role VARCHAR NOT NULL DEFAULT 'public', -- public, health_worker, registrar, admin
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verification_token VARCHAR,
    verification_token_expiry TIMESTAMP,
    reset_token VARCHAR,
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Birth registrations table
CREATE TABLE birth_registrations (
    id SERIAL PRIMARY KEY,
    application_id VARCHAR NOT NULL UNIQUE, -- BR2024001 format
    
    -- Child information
    child_name VARCHAR NOT NULL,
    child_sex VARCHAR NOT NULL, -- male, female
    date_of_birth DATE NOT NULL,
    time_of_birth VARCHAR,
    place_of_birth VARCHAR NOT NULL,
    
    -- Father information
    father_name VARCHAR NOT NULL,
    father_national_id VARCHAR NOT NULL,
    father_date_of_birth DATE,
    father_occupation VARCHAR,
    
    -- Mother information
    mother_name VARCHAR NOT NULL,
    mother_national_id VARCHAR NOT NULL,
    mother_date_of_birth DATE,
    mother_occupation VARCHAR,
    
    -- Application metadata
    submitted_by VARCHAR NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    reviewed_by VARCHAR,
    review_notes TEXT,
    certificate_number VARCHAR UNIQUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Death registrations table
CREATE TABLE death_registrations (
    id SERIAL PRIMARY KEY,
    application_id VARCHAR NOT NULL UNIQUE, -- DR2024001 format
    
    -- Deceased information
    deceased_name VARCHAR NOT NULL,
    date_of_death DATE NOT NULL,
    time_of_death VARCHAR,
    place_of_death VARCHAR NOT NULL,
    cause_of_death TEXT NOT NULL,
    
    -- Next of kin information
    next_of_kin_name VARCHAR NOT NULL,
    next_of_kin_relationship VARCHAR NOT NULL,
    next_of_kin_contact VARCHAR NOT NULL,
    next_of_kin_national_id VARCHAR,
    
    -- Application metadata
    submitted_by VARCHAR NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    reviewed_by VARCHAR,
    review_notes TEXT,
    certificate_number VARCHAR UNIQUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Document uploads table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    application_id VARCHAR NOT NULL,
    application_type VARCHAR NOT NULL, -- birth, death
    document_type VARCHAR NOT NULL, -- medical_certificate, parent_id, next_of_kin_id
    file_name VARCHAR NOT NULL,
    file_path VARCHAR NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR,
    uploaded_by VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraint
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Indexes for better performance
CREATE INDEX idx_birth_registrations_application_id ON birth_registrations(application_id);
CREATE INDEX idx_birth_registrations_status ON birth_registrations(status);
CREATE INDEX idx_birth_registrations_submitted_by ON birth_registrations(submitted_by);
CREATE INDEX idx_birth_registrations_certificate_number ON birth_registrations(certificate_number);

CREATE INDEX idx_death_registrations_application_id ON death_registrations(application_id);
CREATE INDEX idx_death_registrations_status ON death_registrations(status);
CREATE INDEX idx_death_registrations_submitted_by ON death_registrations(submitted_by);
CREATE INDEX idx_death_registrations_certificate_number ON death_registrations(certificate_number);

CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_documents_application_type ON documents(application_type);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

-- Insert default admin user (optional)
-- INSERT INTO users (id, email, first_name, last_name, role) 
-- VALUES ('admin-001', 'admin@registry.gov.gh', 'System', 'Administrator', 'admin');

-- Insert users with different roles (passwords are hashed using bcrypt)
-- All passwords are 'Password123!' hashed with bcrypt
INSERT INTO users (id, email, password, first_name, last_name, role, is_verified) VALUES
('user-001', 'public@example.com', '$2b$10$6jXzGkf.Z3qH.Ay9nS/O.uqbhG0QzZ0DMHjVB9xk7.BwgOQI8zqPi', 'John', 'Public', 'public', true),
('user-002', 'health@example.com', '$2b$10$6jXzGkf.Z3qH.Ay9nS/O.uqbhG0QzZ0DMHjVB9xk7.BwgOQI8zqPi', 'Sarah', 'Health', 'health_worker', true),
('user-003', 'registrar@example.com', '$2b$10$6jXzGkf.Z3qH.Ay9nS/O.uqbhG0QzZ0DMHjVB9xk7.BwgOQI8zqPi', 'Michael', 'Registrar', 'registrar', true),
('user-004', 'admin@example.com', '$2b$10$6jXzGkf.Z3qH.Ay9nS/O.uqbhG0QzZ0DMHjVB9xk7.BwgOQI8zqPi', 'Alice', 'Admin', 'admin', true);
