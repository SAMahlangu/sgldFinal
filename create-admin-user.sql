-- Create Admin User
-- Run this in your Supabase SQL Editor

-- Create an admin user
INSERT INTO users (email, full_name, password_hash, role, created_at)
VALUES (
    'admin@sgld.com',
    'SGLD Administrator',
    'admin123', -- Simple password for demo
    'admin',
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    full_name = 'SGLD Administrator';

-- Verify the admin user was created
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM users 
WHERE email = 'admin@sgld.com';

-- Show all users with their roles
SELECT 
    email,
    full_name,
    role,
    created_at
FROM users 
ORDER BY created_at DESC; 