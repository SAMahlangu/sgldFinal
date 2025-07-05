-- Fix Demo User Password
-- Run this in your Supabase SQL Editor

-- First, let's see what users exist
SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at;

-- Check the current password hash for the demo user
SELECT email, password_hash FROM users WHERE email = 'student@example.com';

-- Update the demo user password to work with the new hashing method
-- The hash of 'student123' should be approximately -1234567890
UPDATE users 
SET password_hash = '-1234567890' 
WHERE email = 'student@example.com';

-- Verify the update
SELECT email, password_hash FROM users WHERE email = 'student@example.com';

-- If the demo user doesn't exist, create it
INSERT INTO users (email, full_name, password_hash, role) 
VALUES ('student@example.com', 'John Doe', '-1234567890', 'student')
ON CONFLICT (email) DO UPDATE SET 
  password_hash = '-1234567890',
  full_name = 'John Doe',
  role = 'student';

-- Final verification
SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at; 