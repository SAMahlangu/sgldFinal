/*
  # Fix User Table Policies for Registration

  1. Problem
    - RLS is enabled on users table but no INSERT policy exists
    - This prevents new user registration
    - Need to add policies for user registration and authentication

  2. Solution
    - Add INSERT policy for user registration
    - Add UPDATE policy for user data updates
    - Ensure authentication can work properly
*/

-- Add INSERT policy for user registration (allow anyone to create a user)
CREATE POLICY "Allow user registration"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Add UPDATE policy for users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (id = (current_setting('app.current_user_id', true))::uuid);

-- Ensure the SELECT policy allows authentication
-- The existing policy "Users can read own data" with USING (true) should work
-- But let's make it more explicit for authentication
CREATE POLICY "Allow authentication queries"
  ON users
  FOR SELECT
  USING (true); 