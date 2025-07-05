/*
  # Update user password field

  1. Changes
    - Update the demo user password to use plain text instead of bcrypt hash
    - This allows simple password authentication to work

  2. Security Note
    - This is for demo purposes only
    - In production, passwords should be properly hashed
*/

-- Update the demo user password to plain text
UPDATE users 
SET password_hash = 'student123' 
WHERE email = 'student@example.com';

-- Add admin_signature_url column for admin signatures
ALTER TABLE forms ADD COLUMN IF NOT EXISTS admin_signature_url text;