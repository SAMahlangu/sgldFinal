-- Test Storage Setup
-- Run this in your Supabase SQL Editor

-- Check if storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'signatures';

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
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Test if we can insert into storage (this will fail but shows the policy is working)
-- INSERT INTO storage.objects (bucket_id, name, owner, metadata) 
-- VALUES ('signatures', 'test.txt', auth.uid(), '{"test": true}');

-- Check if RLS is enabled on storage.objects
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects'; 