# Signature Storage Troubleshooting Guide

## Issue: Signatures are not being saved to the database

### Step 1: Check Storage Bucket Setup

Run this in your **Supabase SQL Editor**:

```sql
-- Check if signatures bucket exists
SELECT * FROM storage.buckets WHERE id = 'signatures';

-- If it doesn't exist, create it:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('signatures', 'signatures', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg'])
ON CONFLICT (id) DO NOTHING;
```

### Step 2: Check Storage Policies

Run this to verify storage policies:

```sql
-- Check storage policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
```

If policies are missing, run the migration `20250705174000_setup_storage.sql`.

### Step 3: Test Storage Upload

1. **Open browser Developer Tools** (F12)
2. **Go to Console tab**
3. **Navigate to a form** and try to save a signature
4. **Look for these console messages**:
   ```
   Starting signature upload...
   Canvas converted to blob, size: [number]
   Uploading file: signature_[timestamp].png
   File uploaded successfully: [data]
   Public URL generated: [url]
   Signature save callback received URL: [url]
   Signature state updated, form value set to: [url]
   ```

### Step 4: Check Form Submission

When submitting the form, look for:
```
Form submission started
Current signature state: [url]
Form data signature_url: [url]
Final form data to save: { signature_url: [url] }
Form saved successfully
```

### Step 5: Verify Database Storage

Check if the signature URL is actually saved:

```sql
-- Check recent forms for signature URLs
SELECT id, organization_name, signature_url, created_at 
FROM forms 
ORDER BY created_at DESC 
LIMIT 5;
```

### Step 6: Common Issues & Solutions

#### Issue: "Upload failed: [error]"
**Possible causes:**
- Storage bucket doesn't exist
- Missing storage policies
- File size too large
- Invalid file type

**Solutions:**
1. Run the storage migration
2. Check bucket configuration
3. Verify file size limits

#### Issue: "Signature save callback received URL: [url]" but not saved to database
**Possible causes:**
- Form submission error
- RLS policy blocking form save
- Signature URL not included in form data

**Solutions:**
1. Check form submission console logs
2. Verify RLS policies on forms table
3. Ensure signature_url field exists in forms table

#### Issue: "No signature URL in database"
**Possible causes:**
- Signature upload failed
- Form submission failed
- Database field missing

**Solutions:**
1. Check all console logs
2. Verify forms table has signature_url column
3. Test form submission without signature first

### Step 7: Manual Database Check

```sql
-- Check if signature_url column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forms' AND column_name = 'signature_url';

-- Add column if missing
ALTER TABLE forms ADD COLUMN IF NOT EXISTS signature_url text;
```

### Step 8: Test Complete Flow

1. **Create a new form**
2. **Fill in basic information**
3. **Draw and save a signature**
4. **Check console for success messages**
5. **Submit the form**
6. **Check database for signature URL**

### Step 9: Debug Storage Permissions

If uploads are failing, check:

```sql
-- Check if user has proper role
SELECT auth.role();

-- Check storage bucket permissions
SELECT * FROM storage.buckets WHERE id = 'signatures';

-- Test storage access (run as authenticated user)
SELECT * FROM storage.objects WHERE bucket_id = 'signatures' LIMIT 1;
```

### Step 10: Alternative Storage Setup

If the above doesn't work, try creating the bucket manually in Supabase Dashboard:

1. **Go to Storage in Supabase Dashboard**
2. **Click "Create a new bucket"**
3. **Name it "signatures"**
4. **Make it public**
5. **Set file size limit to 5MB**
6. **Allow image types: png, jpeg, jpg**

### Expected Behavior

**Successful signature save should show:**
1. ✅ Canvas blob created
2. ✅ File uploaded to storage
3. ✅ Public URL generated
4. ✅ URL saved to form state
5. ✅ URL included in form submission
6. ✅ URL saved to database

**Check each step in the console logs to identify where the process fails.** 