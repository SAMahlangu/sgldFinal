-- Test Storage Setup
-- Run this in your Supabase SQL Editor to verify everything is working

-- Check if the signatures bucket exists
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'signatures';

-- Check storage policies
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
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Check if RLS is enabled on storage.objects
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Test if we can insert a test record (this will help verify policies)
-- Note: This is just a test, you can delete it after
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES ('signatures', 'test-file.txt', auth.uid(), '{"test": true}')
ON CONFLICT DO NOTHING;

-- Check if the test record was inserted
SELECT 
  bucket_id,
  name,
  owner,
  metadata,
  created_at
FROM storage.objects 
WHERE bucket_id = 'signatures' AND name = 'test-file.txt';

-- Clean up test record
DELETE FROM storage.objects 
WHERE bucket_id = 'signatures' AND name = 'test-file.txt'; 