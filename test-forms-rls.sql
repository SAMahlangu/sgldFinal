-- Test Forms RLS Policies
-- Run this in your Supabase SQL Editor to verify everything is working

-- Check current RLS policies on forms table
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

-- Check if RLS is enabled on forms table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'forms';

-- Check forms table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'forms' 
ORDER BY ordinal_position;

-- Test inserting a form (this will help verify INSERT policy)
-- Note: This is just a test, you can delete it after
INSERT INTO forms (
    organization_name,
    date_submission,
    proposed_dates,
    organization_goal,
    activity_concept,
    activity_objective,
    targeted_population,
    empowerment_opportunities,
    marketing_opportunities,
    accreditation_certification,
    swot_analysis,
    proposed_venues,
    task_team,
    guest_list,
    proposed_programme,
    task_delegation,
    budget_expenditure,
    budget_income,
    facilitator_recommendation,
    evaluation,
    user_id,
    status,
    created_at
) VALUES (
    'Test Organization',
    '2025-01-01',
    '[{"date": "2025-02-01", "description": "Test date"}]',
    'Test goal',
    'Test concept',
    'Test objective',
    'Test population',
    'Test opportunities',
    'Test marketing',
    'Test certification',
    '{"strengths": "Test", "weaknesses": "Test", "opportunities": "Test", "threats": "Test"}',
    '[{"venue": "Test venue", "capacity": "100", "cost": "1000"}]',
    '[{"name": "Test person", "portfolio": "Test portfolio"}]',
    '[{"name": "Test guest", "organization": "Test org", "contact": "test@test.com"}]',
    'Test programme',
    '[{"activity": "Test activity", "person_responsible": "Test person", "assignment_date": "2025-01-01", "target_date": "2025-02-01", "contact_person": "Test contact", "telephone": "1234567890"}]',
    '[{"description": "Test expense", "amount": 100}]',
    '[{"description": "Test income", "amount": 200}]',
    'Test recommendation',
    'Test evaluation',
    '00000000-0000-0000-0000-000000000000', -- Test user ID
    'draft',
    NOW()
) ON CONFLICT DO NOTHING;

-- Check if the test record was inserted
SELECT 
    id,
    organization_name,
    user_id,
    status,
    created_at
FROM forms 
WHERE organization_name = 'Test Organization'
ORDER BY created_at DESC
LIMIT 1;

-- Test updating the form (this will help verify UPDATE policy)
UPDATE forms 
SET organization_name = 'Updated Test Organization'
WHERE organization_name = 'Test Organization';

-- Check if the update worked
SELECT 
    id,
    organization_name,
    user_id,
    status,
    created_at
FROM forms 
WHERE organization_name = 'Updated Test Organization'
ORDER BY created_at DESC
LIMIT 1;

-- Test selecting forms (this will help verify SELECT policy)
SELECT 
    id,
    organization_name,
    user_id,
    status,
    created_at
FROM forms 
ORDER BY created_at DESC
LIMIT 5;

-- Clean up test record
DELETE FROM forms 
WHERE organization_name = 'Updated Test Organization';

-- Verify cleanup
SELECT COUNT(*) as remaining_forms
FROM forms 
WHERE organization_name LIKE '%Test Organization%'; 