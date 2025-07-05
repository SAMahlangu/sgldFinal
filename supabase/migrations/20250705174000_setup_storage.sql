/*
  # Setup Supabase Storage for Signatures

  1. Create storage bucket for signatures
  2. Set up proper policies for file uploads
  3. Ensure users can upload their own signatures
*/

-- Create storage bucket for signatures if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('signatures', 'signatures', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg'])
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload signatures
CREATE POLICY "Users can upload signatures"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'signatures' AND
    auth.role() = 'authenticated'
  );

-- Policy to allow users to view their own signatures
CREATE POLICY "Users can view signatures"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'signatures' AND
    auth.role() = 'authenticated'
  );

-- Policy to allow users to update their own signatures
CREATE POLICY "Users can update signatures"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'signatures' AND
    auth.role() = 'authenticated'
  );

-- Policy to allow users to delete their own signatures
CREATE POLICY "Users can delete signatures"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'signatures' AND
    auth.role() = 'authenticated'
  ); 