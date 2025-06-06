-- Drop all existing tables
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS birth_registrations CASCADE;
DROP TABLE IF EXISTS death_registrations CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

-- Create sessions table
CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- Create index on expire column for session cleanup
CREATE INDEX IDX_session_expire ON sessions(expire);

-- Create users table
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

-- Create birth_registrations table
CREATE TABLE birth_registrations (
    id SERIAL PRIMARY KEY,
    application_id VARCHAR NOT NULL UNIQUE,
    
    -- Child information
    child_name VARCHAR NOT NULL,
    child_sex VARCHAR NOT NULL,
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
    submitted_by VARCHAR NOT NULL REFERENCES users(id),
    status VARCHAR NOT NULL DEFAULT 'pending',
    reviewed_by VARCHAR REFERENCES users(id),
    review_notes TEXT,
    certificate_number VARCHAR UNIQUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create death_registrations table
CREATE TABLE death_registrations (
    id SERIAL PRIMARY KEY,
    application_id VARCHAR NOT NULL UNIQUE,
    
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
    submitted_by VARCHAR NOT NULL REFERENCES users(id),
    status VARCHAR NOT NULL DEFAULT 'pending',
    reviewed_by VARCHAR REFERENCES users(id),
    review_notes TEXT,
    certificate_number VARCHAR UNIQUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create documents table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    application_id VARCHAR NOT NULL,
    application_type VARCHAR NOT NULL,
    document_type VARCHAR NOT NULL,
    file_name VARCHAR NOT NULL,
    file_path VARCHAR NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR,
    uploaded_by VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
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

-- Insert test users
INSERT INTO users (id, email, password, first_name, last_name, role, is_verified) VALUES
('user-001', 'public@example.com', 'public123', 'John', 'Public', 'public', true),
('user-002', 'health@example.com', 'health123', 'Sarah', 'Health', 'health_worker', true),
('user-003', 'registrar@example.com', 'registrar123', 'Michael', 'Registrar', 'registrar', true),
('user-004', 'admin@example.com', 'admin123', 'Alice', 'Admin', 'admin', true),
('user-005', 'isaacaddyasare@gmail.com', 'Zavi1255@', 'isaac', 'addy', 'admin', true);

-- Insert sample birth registration
INSERT INTO birth_registrations (
    application_id, child_name, child_sex, date_of_birth, place_of_birth,
    father_name, father_national_id, mother_name, mother_national_id,
    submitted_by, status
) VALUES (
    'BR2024001', 'Baby Smith', 'male', '2024-01-15', 'Korle Bu Teaching Hospital',
    'John Smith', 'GHA-123456', 'Mary Smith', 'GHA-789012',
    'user-002', 'pending'
);

-- Insert sample death registration
INSERT INTO death_registrations (
    application_id, deceased_name, date_of_death, place_of_death, cause_of_death,
    next_of_kin_name, next_of_kin_relationship, next_of_kin_contact,
    submitted_by, status
) VALUES (
    'DR2024001', 'James Brown', '2024-01-20', 'Ridge Hospital', 'Natural causes',
    'Sarah Brown', 'Daughter', '+233201234567',
    'user-002', 'pending'
); 