-- Test Forms RLS Policies with Custom Authentication
-- Run this in your Supabase SQL Editor

-- First, let's check what users exist in the system
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM users 
ORDER BY created_at DESC
LIMIT 5;

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

-- Get a valid user ID for testing (use the first user found)
DO $$
DECLARE
    test_user_id uuid;
BEGIN
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Using test user ID: %', test_user_id;
        
        -- Set the user context for testing
        PERFORM set_config('app.current_user_id', test_user_id::text, false);
        
        -- Test inserting a form with the valid user ID
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
            'Test Organization - Custom Auth',
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
            test_user_id,
            'draft',
            NOW()
        );
        
        RAISE NOTICE 'Form inserted successfully with user ID: %', test_user_id;
        
        -- Check if the form was inserted
        PERFORM 
            RAISE NOTICE 'Form found: ID=%, Organization=%, User ID=%', 
            id, organization_name, user_id
        FROM forms 
        WHERE organization_name = 'Test Organization - Custom Auth'
        AND user_id = test_user_id;
        
        -- Test updating the form
        UPDATE forms 
        SET organization_name = 'Updated Test Organization - Custom Auth'
        WHERE organization_name = 'Test Organization - Custom Auth'
        AND user_id = test_user_id;
        
        RAISE NOTICE 'Form updated successfully';
        
        -- Test selecting forms
        PERFORM 
            RAISE NOTICE 'Form retrieved: ID=%, Organization=%, User ID=%', 
            id, organization_name, user_id
        FROM forms 
        WHERE user_id = test_user_id
        ORDER BY created_at DESC
        LIMIT 1;
        
        -- Clean up test record
        DELETE FROM forms 
        WHERE organization_name = 'Updated Test Organization - Custom Auth'
        AND user_id = test_user_id;
        
        RAISE NOTICE 'Test form deleted successfully';
        
    ELSE
        RAISE NOTICE 'No users found in the system. Please create a user first.';
    END IF;
END $$;

-- Check if any test forms remain
SELECT COUNT(*) as remaining_test_forms
FROM forms 
WHERE organization_name LIKE '%Test Organization - Custom Auth%';

-- Show current forms in the system
SELECT 
    id,
    organization_name,
    user_id,
    status,
    created_at
FROM forms 
ORDER BY created_at DESC
LIMIT 5; 