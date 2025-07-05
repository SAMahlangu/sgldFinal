-- Fix Demo Users with Correct Password Hashes
-- Run this in your Supabase SQL editor to fix the demo users

-- Update the demo users with the correct password hashes
UPDATE users 
SET password_hash = '-1032466921', role = 'student'
WHERE email = 'student@example.com';

UPDATE users 
SET password_hash = '-969161597', role = 'admin'
WHERE email = 'admin@example.com';

-- Verify the changes
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

-- If the users don't exist, create them
INSERT INTO users (email, full_name, password_hash, role) 
VALUES ('student@example.com', 'Demo Student', '-1032466921', 'student')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, full_name, password_hash, role) 
VALUES ('admin@example.com', 'System Administrator', '-969161597', 'admin')
ON CONFLICT (email) DO NOTHING; 