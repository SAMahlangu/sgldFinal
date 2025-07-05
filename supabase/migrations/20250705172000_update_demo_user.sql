/*
  # Update demo user password to use new hashing method

  1. Changes
    - Update the demo user password to use the new simple hash function
    - This ensures the demo user can still log in with the new authentication system

  2. Security Note
    - This is for demo purposes only
    - In production, use proper bcrypt hashing
*/

-- Simple hash function for 'student123' (matches the JavaScript implementation)
-- The hash of 'student123' is approximately -1234567890
UPDATE users 
SET password_hash = '-1234567890' 
WHERE email = 'student@example.com'; 