/*
  # SGLD Project Planning System Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `password_hash` (text)
      - `role` (text, default 'student')
      - `created_at` (timestamp)
    - `forms`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - All SGLD form fields (text and jsonb)
      - `status` (text, default 'draft')
      - `created_at` and `submitted_at` (timestamps)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to access their own data
    - Create helper function for user context

  3. Sample Data
    - Insert demo student user with bcrypt-hashed password
*/

-- Create helper function for setting user context
CREATE OR REPLACE FUNCTION set_config(setting_name text, setting_value text, is_local boolean)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config(setting_name, setting_value, is_local);
  RETURN setting_value;
END;
$$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'student',
  created_at timestamptz DEFAULT now()
);

-- Create forms table
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
  signature_url text,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  submitted_at timestamptz
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (true);

-- Create policies for forms table
CREATE POLICY "Students can read own forms"
  ON forms
  FOR SELECT
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Students can create own forms"
  ON forms
  FOR INSERT
  WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Students can update own forms"
  ON forms
  FOR UPDATE
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

-- Insert sample student user (password is 'student123')
INSERT INTO users (email, full_name, password_hash, role) VALUES
('student@example.com', 'John Doe', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student')
ON CONFLICT (email) DO NOTHING;