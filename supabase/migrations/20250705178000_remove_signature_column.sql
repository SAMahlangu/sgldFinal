/*
  # Remove Signature Column from Forms Table

  Since we're removing the signature functionality, we need to remove
  the signature_url column from the forms table.
*/

-- Remove the signature_url column from the forms table
ALTER TABLE forms DROP COLUMN IF EXISTS signature_url;

-- Verify the column was removed
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forms' 
ORDER BY ordinal_position; 