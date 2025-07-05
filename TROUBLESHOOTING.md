# Troubleshooting Guide

## Registration Issue: "Registration failed. Email might already be in use."

### Step 1: Check Database Connection

1. **Open your browser's Developer Tools** (F12)
2. **Go to the Console tab**
3. **Navigate to the registration page** (`/register`)
4. **Look for connection status messages**

You should see:
- "Testing connection..."
- "Connected to database" (green) or "Database connection failed" (red)

### Step 2: Check Environment Variables

Make sure your `.env` file exists in the root directory with:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Run Database Migrations

Make sure all migrations have been applied to your Supabase database:

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run these migrations in order:**

```sql
-- Migration 1: Initial schema
-- Run the content of: supabase/migrations/20250705170419_quiet_plain.sql

-- Migration 2: Schema updates  
-- Run the content of: supabase/migrations/20250705170809_still_term.sql

-- Migration 3: Update demo user
-- Run the content of: supabase/migrations/20250705171713_withered_firefly.sql

-- Migration 4: Fix user policies (IMPORTANT!)
-- Run the content of: supabase/migrations/20250705173000_fix_user_policies.sql

-- Migration 5: Update demo user password
-- Run the content of: supabase/migrations/20250705172000_update_demo_user.sql
```

### Step 4: Check RLS Policies

In your Supabase SQL Editor, run:

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'users';
```

You should see policies for:
- SELECT (authentication)
- INSERT (registration)
- UPDATE (user updates)

### Step 5: Test Database Permissions

Run this test query in Supabase SQL Editor:

```sql
-- Test if we can insert a user
INSERT INTO users (email, full_name, password_hash, role) 
VALUES ('test@example.com', 'Test User', 'test-hash', 'student')
RETURNING id, email, full_name;

-- Clean up test data
DELETE FROM users WHERE email = 'test@example.com';
```

### Step 6: Check Console Logs

When you try to register, check the browser console for detailed error messages:

1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Try to register a new user**
4. **Look for error messages** like:
   - "Registration error: ..."
   - "Error details: ..."
   - "Supabase connection test failed: ..."

### Step 7: Common Issues and Solutions

#### Issue: "new row violates row-level security policy"
**Solution**: Run the migration `20250705173000_fix_user_policies.sql`

#### Issue: "relation 'users' does not exist"
**Solution**: Run the initial migration `20250705170419_quiet_plain.sql`

#### Issue: "invalid input syntax for type uuid"
**Solution**: Check that your Supabase URL and key are correct

#### Issue: "permission denied for table users"
**Solution**: Make sure you're using the anon key, not the service role key

### Step 8: Manual Database Setup

If migrations aren't working, manually create the tables:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'student',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow user registration" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authentication queries" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (id = (current_setting('app.current_user_id', true))::uuid);

-- Insert demo user
INSERT INTO users (email, full_name, password_hash, role) VALUES
('student@example.com', 'John Doe', '-1234567890', 'student')
ON CONFLICT (email) DO NOTHING;
```

### Step 9: Contact Support

If none of the above steps work:

1. **Check the browser console** for specific error messages
2. **Verify your Supabase project** is active and accessible
3. **Ensure your API keys** have the correct permissions
4. **Try creating a new Supabase project** and running the migrations fresh

### Debug Information

When reporting issues, include:
- Browser console logs
- Supabase project URL (without the key)
- Error messages from the registration attempt
- Steps you've already tried 