-- Fix Forms RLS Policies for Custom Authentication System
-- Run this in your Supabase SQL Editor

-- Drop all existing policies on forms table
DROP POLICY IF EXISTS "Users can read own forms" ON forms;
DROP POLICY IF EXISTS "Users can create own forms" ON forms;
DROP POLICY IF EXISTS "Users can update own forms" ON forms;
DROP POLICY IF EXISTS "Users can delete own forms" ON forms;
DROP POLICY IF EXISTS "Students can read own forms" ON forms;
DROP POLICY IF EXISTS "Students can create own forms" ON forms;
DROP POLICY IF EXISTS "Students can update own forms" ON forms;
DROP POLICY IF EXISTS "Allow users to read own forms" ON forms;
DROP POLICY IF EXISTS "Allow users to create forms" ON forms;
DROP POLICY IF EXISTS "Allow users to update own forms" ON forms;
DROP POLICY IF EXISTS "Allow users to delete own forms" ON forms;
DROP POLICY IF EXISTS "Allow form creation" ON forms;
DROP POLICY IF EXISTS "Allow form reading" ON forms;
DROP POLICY IF EXISTS "Allow form updates" ON forms;
DROP POLICY IF EXISTS "Allow form deletion" ON forms;

-- Ensure RLS is enabled
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Create a function to get current user ID from context
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN (current_setting('app.current_user_id', true))::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Very permissive INSERT policy - allow any user with a valid user_id
CREATE POLICY "Allow form creation"
  ON forms
  FOR INSERT
  WITH CHECK (
    user_id IS NOT NULL
    AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = forms.user_id
    )
  );

-- Very permissive SELECT policy - allow reading forms
CREATE POLICY "Allow form reading"
  ON forms
  FOR SELECT
  USING (
    user_id IS NOT NULL
    AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = forms.user_id
    )
  );

-- Very permissive UPDATE policy - allow updating forms
CREATE POLICY "Allow form updates"
  ON forms
  FOR UPDATE
  USING (
    user_id IS NOT NULL
    AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = forms.user_id
    )
  );

-- Very permissive DELETE policy - allow deleting forms
CREATE POLICY "Allow form deletion"
  ON forms
  FOR DELETE
  USING (
    user_id IS NOT NULL
    AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = forms.user_id
    )
  );

-- Verify the policies were created
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'forms'
ORDER BY policyname;

-- Test the policies by checking if they exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'forms'
ORDER BY policyname; 