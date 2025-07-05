-- Debug Users Script
-- Run this in your Supabase SQL editor to check current users

-- Check if users table exists and has data
SELECT COUNT(*) as total_users FROM users;

-- View all users (without password hashes for security)
SELECT id, email, full_name, role, created_at 
FROM users 
ORDER BY created_at;

-- Check specific demo users
SELECT id, email, full_name, role, password_hash 
FROM users 
WHERE email IN ('student@example.com', 'admin@example.com');

-- Test the hash function manually
-- For password "student123", the hash should be: -1234567890
-- For password "admin123", the hash should be: -1234567891

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- Test if we can select users (this should work)
SELECT 'Connection test successful' as status; 