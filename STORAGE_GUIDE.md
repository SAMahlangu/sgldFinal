# Supabase Storage Usage Guide

This guide explains how to use Supabase storage endpoints in your application.

## Table of Contents
1. [Basic Setup](#basic-setup)
2. [Storage Operations](#storage-operations)
3. [Bucket Management](#bucket-management)
4. [File Operations](#file-operations)
5. [Security & RLS](#security--rls)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Basic Setup

### 1. Initialize Supabase Client
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 2. Environment Variables
Create a `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Storage Operations

### Upload Files
```javascript
// Basic upload
const uploadFile = async (file) => {
  const fileName = `file_${Date.now()}.png`
  
  const { data, error } = await supabase.storage
    .from('bucket-name')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  return data
}

// Upload with metadata
const uploadWithMetadata = async (file, metadata) => {
  const fileName = `file_${Date.now()}.png`
  
  const { data, error } = await supabase.storage
    .from('bucket-name')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      metadata: {
        userId: 'user123',
        uploadedAt: new Date().toISOString(),
        fileType: file.type,
        ...metadata
      }
    })

  return { data, error }
}
```

### Download Files
```javascript
// Download file as blob
const downloadFile = async (fileName) => {
  const { data, error } = await supabase.storage
    .from('bucket-name')
    .download(fileName)

  if (error) {
    console.error('Download error:', error)
    return null
  }

  return data
}

// Get public URL
const getPublicUrl = (fileName) => {
  const { data } = supabase.storage
    .from('bucket-name')
    .getPublicUrl(fileName)

  return data.publicUrl
}
```

### List Files
```javascript
// List all files in bucket
const listFiles = async () => {
  const { data, error } = await supabase.storage
    .from('bucket-name')
    .list()

  if (error) {
    console.error('List error:', error)
    return []
  }

  return data || []
}

// List files in a folder
const listFilesInFolder = async (folderPath) => {
  const { data, error } = await supabase.storage
    .from('bucket-name')
    .list(folderPath)

  return data || []
}
```

### Delete Files
```javascript
// Delete single file
const deleteFile = async (fileName) => {
  const { data, error } = await supabase.storage
    .from('bucket-name')
    .remove([fileName])

  if (error) {
    console.error('Delete error:', error)
    return false
  }

  return true
}

// Delete multiple files
const deleteMultipleFiles = async (fileNames) => {
  const { data, error } = await supabase.storage
    .from('bucket-name')
    .remove(fileNames)

  return { data, error }
}
```

## Bucket Management

### Get Bucket Information
```javascript
const getBucketInfo = async (bucketName) => {
  const { data, error } = await supabase.storage.getBucket(bucketName)
  
  if (error) {
    console.error('Get bucket error:', error)
    return null
  }

  return data
}
```

### List All Buckets
```javascript
const listBuckets = async () => {
  const { data, error } = await supabase.storage.listBuckets()
  
  if (error) {
    console.error('List buckets error:', error)
    return []
  }

  return data || []
}
```

## File Operations

### Move/Rename Files
```javascript
const moveFile = async (oldPath, newPath) => {
  const { data, error } = await supabase.storage
    .from('bucket-name')
    .move(oldPath, newPath)

  return { data, error }
}
```

### Update File Metadata
```javascript
const updateMetadata = async (fileName, metadata) => {
  const { data, error } = await supabase.storage
    .from('bucket-name')
    .update(fileName, {
      metadata: metadata
    })

  return { data, error }
}
```

### Copy Files
```javascript
const copyFile = async (sourcePath, destinationPath) => {
  const { data, error } = await supabase.storage
    .from('bucket-name')
    .copy(sourcePath, destinationPath)

  return { data, error }
}
```

## Security & RLS

### Row Level Security (RLS)
Storage uses RLS policies similar to database tables. Here are common policy examples:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'your-bucket' AND
  auth.role() = 'authenticated'
);

-- Allow users to view their own files
CREATE POLICY "Allow viewing" ON storage.objects
FOR SELECT USING (
  bucket_id = 'your-bucket' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own files
CREATE POLICY "Allow updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'your-bucket' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Allow deletion" ON storage.objects
FOR DELETE USING (
  bucket_id = 'your-bucket' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Public vs Private Buckets
```javascript
// Public bucket - files are accessible via public URL
const publicUrl = supabase.storage
  .from('public-bucket')
  .getPublicUrl('file.jpg')

// Private bucket - files require authentication
const privateUrl = supabase.storage
  .from('private-bucket')
  .createSignedUrl('file.jpg', 3600) // 1 hour expiry
```

## Best Practices

### 1. File Validation
```javascript
const validateFile = (file, maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png']) => {
  const errors = []

  if (!file) {
    errors.push('No file provided')
    return errors
  }

  if (file.size > maxSize) {
    errors.push(`File size exceeds ${maxSize} bytes`)
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} not allowed`)
  }

  return errors
}
```

### 2. Unique File Names
```javascript
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substr(2, 9)
  const extension = originalName.split('.').pop()
  
  return `${timestamp}_${randomString}.${extension}`
}
```

### 3. Error Handling
```javascript
const safeUpload = async (file, bucketName) => {
  try {
    // Validate file
    const validationErrors = validateFile(file)
    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors }
    }

    // Generate unique name
    const fileName = generateUniqueFileName(file.name)

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        }
      })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### 4. Progress Tracking
```javascript
const uploadWithProgress = async (file, onProgress) => {
  const fileName = generateUniqueFileName(file.name)
  
  const { data, error } = await supabase.storage
    .from('bucket-name')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  // Note: Supabase doesn't provide built-in progress tracking
  // You can implement your own using XMLHttpRequest or fetch with progress events
}
```

## Troubleshooting

### Common Issues

#### 1. 403 Forbidden Error
**Problem**: "new row violates row-level security policy"
**Solution**: Check your RLS policies and ensure the user has proper permissions.

```sql
-- More permissive policy for testing
CREATE POLICY "Allow all operations" ON storage.objects
FOR ALL USING (bucket_id = 'your-bucket');
```

#### 2. File Size Limits
**Problem**: Large files fail to upload
**Solution**: Check bucket file size limits and client-side validation.

```javascript
// Check bucket limits
const bucketInfo = await supabase.storage.getBucket('your-bucket')
console.log('Max file size:', bucketInfo.file_size_limit)
```

#### 3. CORS Issues
**Problem**: Uploads fail in browser
**Solution**: Configure CORS settings in your Supabase dashboard.

#### 4. Authentication Issues
**Problem**: Uploads fail for authenticated users
**Solution**: Ensure user is properly authenticated before upload.

```javascript
// Check authentication status
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  console.error('User not authenticated')
  return
}
```

### Debug Tools

#### 1. Test Storage Connection
```javascript
const testStorageConnection = async () => {
  try {
    // Test bucket access
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('your-bucket')
    console.log('Bucket test:', bucketError ? 'Failed' : 'Success', bucketData)

    // Test file listing
    const { data: listData, error: listError } = await supabase.storage.from('your-bucket').list()
    console.log('List test:', listError ? 'Failed' : 'Success', listData)

    return !bucketError && !listError
  } catch (error) {
    console.error('Storage connection test failed:', error)
    return false
  }
}
```

#### 2. Check User Permissions
```javascript
const checkUserPermissions = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  console.log('Current user:', user)

  if (user) {
    // Test if user can access storage
    const { data, error } = await supabase.storage.from('your-bucket').list()
    console.log('Storage access test:', error ? 'Failed' : 'Success')
  }
}
```

## Example Implementation

See `src/components/FileUploadExample.tsx` for a complete React component that demonstrates:
- File upload with validation
- Progress tracking
- Error handling
- File listing and management
- Download functionality
- Delete operations

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage API Reference](https://supabase.com/docs/reference/javascript/storage-createbucket)
- [RLS Policies for Storage](https://supabase.com/docs/guides/storage/security)
- [Storage Best Practices](https://supabase.com/docs/guides/storage/best-practices) 