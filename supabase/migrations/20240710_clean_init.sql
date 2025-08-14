-- SGLD Project: Clean Database Migration (with relaxed policies for local dev)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authentication queries" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Allow all to read forms" ON forms;
DROP POLICY IF EXISTS "Allow all to create forms" ON forms;
DROP POLICY IF EXISTS "Allow all to update forms" ON forms;

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'student',
  created_at timestamptz DEFAULT now()
);

-- 2. Create forms table
CREATE TABLE IF NOT EXISTS forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  organization_name text,
  date_submission date,
  proposed_dates jsonb DEFAULT '[]',
  organization_goal text,
  activity_concept text,
  activity_objective text,
  targeted_population text,
  empowerment_opportunities text,
  marketing_opportunities text,
  accreditation_certification text,
  swot_analysis jsonb DEFAULT '{"strengths": "", "weaknesses": "", "opportunities": "", "threats": ""}',
  proposed_venues jsonb DEFAULT '[]',
  task_team jsonb DEFAULT '[]',
  guest_list jsonb DEFAULT '[]',
  proposed_programme text,
  task_delegation jsonb DEFAULT '[]',
  budget_expenditure jsonb DEFAULT '[]',
  budget_income jsonb DEFAULT '[]',
  facilitator_recommendation text,
  evaluation text,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  submitted_at timestamptz,
  -- Admin fields
  admin_decision varchar(10) CHECK (admin_decision IN ('approve', 'reject')),
  admin_comments text,
  admin_decision_date timestamptz,
  admin_decision_by uuid REFERENCES users(id),
  admin_signature_url text
);

-- 3. Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- 4. Policies for users table
CREATE POLICY "Allow authentication queries"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Allow user registration"
  ON users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (id = (current_setting('app.current_user_id', true))::uuid);

-- 5. RELAXED Policies for forms table (for local dev)
CREATE POLICY "Allow all to read forms"
  ON forms
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all to create forms"
  ON forms
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all to update forms"
  ON forms
  FOR UPDATE
  USING (true);

-- 6. Helper function for user context (if not already present)
CREATE OR REPLACE FUNCTION set_config(setting_name text, setting_value text, is_local boolean)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config(setting_name, setting_value, is_local);
  RETURN setting_value;
END;
$$;

-- 7. Insert demo users (for login testing)
INSERT INTO users (email, full_name, password_hash, role)
VALUES
  ('student@example.com', 'Demo Student', '-1032466921', 'student'),
  ('admin@example.com', 'System Administrator', '-969161597', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 8. Verify users
SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at;

-- 9. Verify forms table
SELECT * FROM forms LIMIT 1; 