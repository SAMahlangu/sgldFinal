/*
  # Fix Forms Table Policies for Saving

  1. Problem
    - Forms table might have missing or incorrect RLS policies
    - This prevents users from saving their forms
    - Need to ensure proper policies for INSERT, UPDATE, SELECT

  2. Solution
    - Add/update policies for forms table
    - Ensure users can create, read, update their own forms
    - Allow proper form submission and draft saving
*/

-- Ensure RLS is enabled on forms table
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Students can read own forms" ON forms;
DROP POLICY IF EXISTS "Students can create own forms" ON forms;
DROP POLICY IF EXISTS "Students can update own forms" ON forms;

-- Create comprehensive policies for forms table

-- Policy to allow users to read their own forms
CREATE POLICY "Users can read own forms"
  ON forms
  FOR SELECT
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

-- Policy to allow users to create their own forms
CREATE POLICY "Users can create own forms"
  ON forms
  FOR INSERT
  WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);

-- Policy to allow users to update their own forms
CREATE POLICY "Users can update own forms"
  ON forms
  FOR UPDATE
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

-- Policy to allow users to delete their own forms (optional)
CREATE POLICY "Users can delete own forms"
  ON forms
  FOR DELETE
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

-- Verify the policies were created
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'forms'; 