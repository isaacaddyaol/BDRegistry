-- First update existing users with a default password before adding the NOT NULL constraint
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR;
UPDATE users SET password = 'changeme123' WHERE password IS NULL;
ALTER TABLE users ALTER COLUMN password SET NOT NULL;

-- Insert test users with clear passwords
INSERT INTO users (id, email, password, first_name, last_name, role, is_verified) VALUES
('user-001', 'public@example.com', 'public123', 'John', 'Public', 'public', true),
('user-002', 'health@example.com', 'health123', 'Sarah', 'Health', 'health_worker', true),
('user-003', 'registrar@example.com', 'registrar123', 'Michael', 'Registrar', 'registrar', true),
('user-004', 'admin@example.com', 'admin123', 'Alice', 'Admin', 'admin', true)
ON CONFLICT (id) DO UPDATE 
SET password = EXCLUDED.password,
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_verified = EXCLUDED.is_verified; 