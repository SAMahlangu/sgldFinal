-- Test RLS Policies for Forms Table
-- Run this in your Supabase SQL Editor

-- Check current policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'forms'
ORDER BY policyname;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'forms';

-- Test user context function
SELECT set_config('app.current_user_id', 'test-user-id', false);

-- Check current user context
SELECT current_setting('app.current_user_id', true);

-- Test if we can insert a form (this should work with the new policies)
-- Note: Replace 'your-user-id' with an actual user ID from your users table
INSERT INTO forms (
    user_id, 
    organization_name, 
    date_submission, 
    status
) VALUES (
    'your-user-id'::uuid,  -- Replace with actual user ID
    'Test Organization',
    CURRENT_DATE,
    'draft'
) RETURNING id, organization_name, status;

-- Clean up test data
-- DELETE FROM forms WHERE organization_name = 'Test Organization'; 