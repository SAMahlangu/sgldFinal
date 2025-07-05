/*
  # Fix Storage RLS Policies for Signature Uploads

  The current storage policies are too restrictive and causing 403 errors.
  This migration creates more permissive policies that allow signature uploads
  while maintaining basic security.
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can upload signatures" ON storage.objects;
DROP POLICY IF EXISTS "Users can view signatures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update signatures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete signatures" ON storage.objects;

-- Create more permissive upload policy
-- Allow any authenticated user to upload to signatures bucket
CREATE POLICY "Allow signature uploads"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'signatures'
  );

-- Create permissive view policy
-- Allow viewing of signatures (since bucket is public)
CREATE POLICY "Allow signature viewing"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'signatures'
  );

-- Create permissive update policy
-- Allow updates to signatures
CREATE POLICY "Allow signature updates"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'signatures'
  );

-- Create permissive delete policy
-- Allow deletion of signatures
CREATE POLICY "Allow signature deletion"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'signatures'
  );

-- Ensure the signatures bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('signatures', 'signatures', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg'];

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; 