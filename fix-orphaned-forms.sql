-- Fix Orphaned Forms - Forms without proper user_id
-- Run this in your Supabase SQL Editor

-- First, let's see what forms exist and their user_id status
SELECT 
    id,
    organization_name,
    user_id,
    status,
    created_at,
    CASE 
        WHEN user_id IS NULL THEN 'MISSING USER_ID'
        WHEN user_id NOT IN (SELECT id FROM users) THEN 'INVALID USER_ID'
        ELSE 'VALID'
    END as user_id_status
FROM forms 
ORDER BY created_at DESC;

-- Count forms by user_id status
SELECT 
    CASE 
        WHEN user_id IS NULL THEN 'MISSING USER_ID'
        WHEN user_id NOT IN (SELECT id FROM users) THEN 'INVALID USER_ID'
        ELSE 'VALID'
    END as user_id_status,
    COUNT(*) as count
FROM forms 
GROUP BY 
    CASE 
        WHEN user_id IS NULL THEN 'MISSING USER_ID'
        WHEN user_id NOT IN (SELECT id FROM users) THEN 'INVALID USER_ID'
        ELSE 'VALID'
    END;

-- Get the first valid user ID to assign to orphaned forms
SELECT id, email, full_name, role 
FROM users 
WHERE role = 'student'
ORDER BY created_at 
LIMIT 1;

-- Fix forms with missing user_id (assign to first student user)
-- Uncomment and run this if you have orphaned forms:
/*
UPDATE forms 
SET user_id = (
    SELECT id FROM users 
    WHERE role = 'student' 
    ORDER BY created_at 
    LIMIT 1
)
WHERE user_id IS NULL;
*/

-- Fix forms with invalid user_id (assign to first student user)
-- Uncomment and run this if you have forms with invalid user_id:
/*
UPDATE forms 
SET user_id = (
    SELECT id FROM users 
    WHERE role = 'student' 
    ORDER BY created_at 
    LIMIT 1
)
WHERE user_id NOT IN (SELECT id FROM users);
*/

-- Verify the fix worked
SELECT 
    id,
    organization_name,
    user_id,
    status,
    created_at,
    CASE 
        WHEN user_id IS NULL THEN 'MISSING USER_ID'
        WHEN user_id NOT IN (SELECT id FROM users) THEN 'INVALID USER_ID'
        ELSE 'VALID'
    END as user_id_status
FROM forms 
ORDER BY created_at DESC; 