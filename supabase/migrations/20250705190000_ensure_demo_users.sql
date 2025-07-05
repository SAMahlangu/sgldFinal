-- Ensure demo users exist with correct password hashes
-- This migration ensures the demo users are properly set up

-- First, let's check if the demo users exist
DO $$
BEGIN
    -- Check if student user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'student@example.com') THEN
        INSERT INTO users (email, full_name, password_hash, role) 
        VALUES ('student@example.com', 'Demo Student', '-1032466921', 'student');
        RAISE NOTICE 'Created demo student user';
    ELSE
        RAISE NOTICE 'Demo student user already exists';
    END IF;

    -- Check if admin user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com') THEN
        INSERT INTO users (email, full_name, password_hash, role) 
        VALUES ('admin@example.com', 'System Administrator', '-969161597', 'admin');
        RAISE NOTICE 'Created demo admin user';
    ELSE
        RAISE NOTICE 'Demo admin user already exists';
    END IF;
END $$;

-- Update existing demo users to ensure correct password hashes
UPDATE users 
SET password_hash = '-1032466921', role = 'student'
WHERE email = 'student@example.com';

UPDATE users 
SET password_hash = '-969161597', role = 'admin'
WHERE email = 'admin@example.com';

-- Verify the users exist and have correct data
SELECT 
    email, 
    full_name, 
    role, 
    CASE 
        WHEN password_hash = '-1032466921' THEN 'student123'
        WHEN password_hash = '-969161597' THEN 'admin123'
        ELSE 'unknown'
    END as password,
    created_at
FROM users 
WHERE email IN ('student@example.com', 'admin@example.com')
ORDER BY email; 