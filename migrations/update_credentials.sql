-- Update existing users with new credentials
UPDATE users SET 
    password = 'Admin@123',
    email = 'admin@registry.gov.gh',
    first_name = 'System',
    last_name = 'Administrator',
    role = 'admin',
    is_verified = true
WHERE id = 'user-004';

UPDATE users SET 
    password = 'Health@123',
    email = 'health@registry.gov.gh',
    first_name = 'Health',
    last_name = 'Officer',
    role = 'health_worker',
    is_verified = true
WHERE id = 'user-002';

UPDATE users SET 
    password = 'Registrar@123',
    email = 'registrar@registry.gov.gh',
    first_name = 'Registry',
    last_name = 'Officer',
    role = 'registrar',
    is_verified = true
WHERE id = 'user-003';

UPDATE users SET 
    password = 'Public@123',
    email = 'public@registry.gov.gh',
    first_name = 'Public',
    last_name = 'User',
    role = 'public',
    is_verified = true
WHERE id = 'user-001';

-- Keep Isaac's account unchanged
UPDATE users SET 
    is_verified = true
WHERE email = 'isaacaddyasare@gmail.com'; 