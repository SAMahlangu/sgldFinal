/*
  # Add Admin Decision Fields to Forms Table

  This migration adds fields to track admin decisions on submitted forms:
  - admin_decision: 'approve' or 'reject'
  - admin_comments: Comments from admin about the decision
  - admin_decision_date: When the decision was made
  - admin_decision_by: Which admin made the decision
*/

-- Add admin decision fields to forms table
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS admin_decision VARCHAR(10) CHECK (admin_decision IN ('approve', 'reject')),
ADD COLUMN IF NOT EXISTS admin_comments TEXT,
ADD COLUMN IF NOT EXISTS admin_decision_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_decision_by UUID REFERENCES users(id);

-- Update existing forms to have 'submitted' status if they were previously 'submitted'
-- This ensures consistency with the new admin workflow
UPDATE forms 
SET status = 'submitted' 
WHERE status = 'submitted' 
AND admin_decision IS NULL;

-- Create index for better performance on admin queries
CREATE INDEX IF NOT EXISTS idx_forms_admin_decision ON forms(admin_decision);
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_submitted_at ON forms(submitted_at);

-- Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'forms' 
AND column_name LIKE 'admin_%'
ORDER BY ordinal_position; 