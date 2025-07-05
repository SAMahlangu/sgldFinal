-- Fix Admin Authentication Issues
-- This script verifies and fixes admin user authentication

-- 1. Check if admin user exists
SELECT 
    id,
    email,
    full_name,
    role,
    password_hash,
    created_at
FROM users 
WHERE email = 'admin@example.com';

-- 2. If admin user doesn't exist, create it
INSERT INTO users (email, full_name, password_hash, role)
SELECT 
    'admin@example.com',
    'System Administrator',
    '-969161597', -- This is the hash for 'admin123'
    'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@example.com'
);

-- 3. Update existing admin user to ensure correct credentials
UPDATE users 
SET 
    password_hash = '-969161597',
    role = 'admin',
    full_name = 'System Administrator'
WHERE email = 'admin@example.com';

-- 4. Verify admin user is properly set up
SELECT 
    id,
    email,
    full_name,
    role,
    CASE 
        WHEN password_hash = '-969161597' THEN 'admin123'
        ELSE 'unknown'
    END as password,
    created_at
FROM users 
WHERE email = 'admin@example.com';

-- 5. Check all users for debugging
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM users 
ORDER BY created_at DESC;

-- 6. Test admin user authentication
-- This simulates the login process
SELECT 
    id,
    email,
    full_name,
    role
FROM users 
WHERE email = 'admin@example.com' 
AND password_hash = '-969161597'
AND role = 'admin'; 