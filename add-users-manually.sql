-- Manual User Management Script for SGLD System
-- Use this script to add users manually to the database

-- First, let's see the current users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Example: Add a student user
-- Note: The password_hash is generated using the same hash function as the app
-- For password "student123", the hash is: -1032466921
INSERT INTO users (email, full_name, password_hash, role) 
VALUES ('student@example.com', 'Demo Student', '-1032466921', 'student');

-- Example: Add an admin user  
-- For password "admin123", the hash is: -969161597
INSERT INTO users (email, full_name, password_hash, role) 
VALUES ('admin@example.com', 'System Administrator', '-969161597', 'admin');

-- Example: Add another student
INSERT INTO users (email, full_name, password_hash, role) 
VALUES ('john.doe@university.edu', 'John Doe', '-1234567892', 'student');

-- Example: Add another admin
INSERT INTO users (email, full_name, password_hash, role) 
VALUES ('faculty.admin@university.edu', 'Faculty Admin', '-1234567893', 'admin');

-- View all users (without password hashes for security)
SELECT id, email, full_name, role, created_at 
FROM users 
ORDER BY created_at;

-- To update a user's role (e.g., promote a student to admin)
-- UPDATE users SET role = 'admin' WHERE email = 'student@example.com';

-- To delete a user (be careful!)
-- DELETE FROM users WHERE email = 'student@example.com';

-- To change a user's password, you need to generate the hash first
-- For example, if you want to change password to "newpassword123"
-- The hash would be calculated by the app, but you can test it by:
-- 1. Try logging in with the new password
-- 2. Check the console logs to see the hash
-- 3. Then update the database:
-- UPDATE users SET password_hash = 'NEW_HASH_VALUE' WHERE email = 'user@example.com';

-- Check RLS policies are working
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- Test that users can be selected (this should work for authenticated users)
-- This query will only work if you're authenticated as a user
SELECT COUNT(*) as total_users FROM users; 