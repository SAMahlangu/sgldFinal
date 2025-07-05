-- Remove Signature Column from Forms Table
-- Run this in your Supabase SQL Editor

-- Remove the signature_url column from the forms table
ALTER TABLE forms DROP COLUMN IF EXISTS signature_url;

-- Verify the column was removed
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forms' 
ORDER BY ordinal_position;

-- Check current table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'forms' 
ORDER BY ordinal_position; 