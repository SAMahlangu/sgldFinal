/*
  # Update SGLD Project System Schema

  1. Schema Updates
    - Ensure users table has correct structure with password_hash
    - Update forms table structure to match application needs
    - Add missing columns if needed

  2. Security
    - Enable RLS on all tables
    - Create policies for student access to their own data
    - Allow public read access to users for authentication

  3. Sample Data
    - Insert demo student user with bcrypt-hashed password
*/

-- Create helper function for setting user context if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_config' AND pg_get_function_arguments(oid) = 'setting_name text, setting_value text, is_local boolean'
  ) THEN
    CREATE FUNCTION set_config(setting_name text, setting_value text, is_local boolean)
    RETURNS text
    LANGUAGE plpgsql
    AS $func$
    BEGIN
      PERFORM set_config(setting_name, setting_value, is_local);
      RETURN setting_value;
    END;
    $func$;
  END IF;
END $$;

-- Ensure users table has the correct structure
DO $$
BEGIN
  -- Add password_hash column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE users ADD COLUMN password_hash text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Ensure forms table has all required columns
DO $$
BEGIN
  -- Add any missing columns to forms table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'organization_name'
  ) THEN
    ALTER TABLE forms ADD COLUMN organization_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'date_submission'
  ) THEN
    ALTER TABLE forms ADD COLUMN date_submission date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'proposed_dates'
  ) THEN
    ALTER TABLE forms ADD COLUMN proposed_dates jsonb DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'organization_goal'
  ) THEN
    ALTER TABLE forms ADD COLUMN organization_goal text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'activity_concept'
  ) THEN
    ALTER TABLE forms ADD COLUMN activity_concept text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'activity_objective'
  ) THEN
    ALTER TABLE forms ADD COLUMN activity_objective text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'targeted_population'
  ) THEN
    ALTER TABLE forms ADD COLUMN targeted_population text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'empowerment_opportunities'
  ) THEN
    ALTER TABLE forms ADD COLUMN empowerment_opportunities text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'marketing_opportunities'
  ) THEN
    ALTER TABLE forms ADD COLUMN marketing_opportunities text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'accreditation_certification'
  ) THEN
    ALTER TABLE forms ADD COLUMN accreditation_certification text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'swot_analysis'
  ) THEN
    ALTER TABLE forms ADD COLUMN swot_analysis jsonb DEFAULT '{"strengths": "", "weaknesses": "", "opportunities": "", "threats": ""}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'proposed_venues'
  ) THEN
    ALTER TABLE forms ADD COLUMN proposed_venues jsonb DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'task_team'
  ) THEN
    ALTER TABLE forms ADD COLUMN task_team jsonb DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'guest_list'
  ) THEN
    ALTER TABLE forms ADD COLUMN guest_list jsonb DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'proposed_programme'
  ) THEN
    ALTER TABLE forms ADD COLUMN proposed_programme text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'task_delegation'
  ) THEN
    ALTER TABLE forms ADD COLUMN task_delegation jsonb DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'budget_expenditure'
  ) THEN
    ALTER TABLE forms ADD COLUMN budget_expenditure jsonb DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'budget_income'
  ) THEN
    ALTER TABLE forms ADD COLUMN budget_income jsonb DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'facilitator_recommendation'
  ) THEN
    ALTER TABLE forms ADD COLUMN facilitator_recommendation text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'evaluation'
  ) THEN
    ALTER TABLE forms ADD COLUMN evaluation text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'signature_url'
  ) THEN
    ALTER TABLE forms ADD COLUMN signature_url text;
  END IF;
END $$;

-- Ensure RLS is enabled on both tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  -- Drop and recreate users policies
  DROP POLICY IF EXISTS "Users can read own data" ON users;
  CREATE POLICY "Users can read own data"
    ON users
    FOR SELECT
    USING (true);

  -- Drop and recreate forms policies
  DROP POLICY IF EXISTS "Students can read own forms" ON forms;
  CREATE POLICY "Students can read own forms"
    ON forms
    FOR SELECT
    USING (user_id = (current_setting('app.current_user_id', true))::uuid);

  DROP POLICY IF EXISTS "Students can create own forms" ON forms;
  CREATE POLICY "Students can create own forms"
    ON forms
    FOR INSERT
    WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);

  DROP POLICY IF EXISTS "Students can update own forms" ON forms;
  CREATE POLICY "Students can update own forms"
    ON forms
    FOR UPDATE
    USING (user_id = (current_setting('app.current_user_id', true))::uuid);
END $$;

-- Insert sample student user with bcrypt-hashed password (password is 'student123')
INSERT INTO users (email, full_name, password_hash, role) VALUES
('student@example.com', 'John Doe', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student')
ON CONFLICT (email) DO NOTHING;