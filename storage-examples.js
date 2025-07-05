// Supabase Storage Usage Examples
// This file shows how to use different storage endpoints

import { supabase } from './src/lib/supabase'

// ============================================================================
// 1. BASIC STORAGE OPERATIONS
// ============================================================================

// Upload a file
const uploadFile = async (file, bucketName = 'signatures') => {
  try {
    const fileName = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    console.log('File uploaded successfully:', data)
    return data
  } catch (error) {
    console.error('Upload failed:', error)
    return null
  }
}

// Download a file
const downloadFile = async (fileName, bucketName = 'signatures') => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(fileName)

    if (error) {
      console.error('Download error:', error)
      return null
    }

    console.log('File downloaded successfully')
    return data
  } catch (error) {
    console.error('Download failed:', error)
    return null
  }
}

// Get public URL for a file
const getPublicUrl = (fileName, bucketName = 'signatures') => {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName)

  return data.publicUrl
}

// List files in a bucket
const listFiles = async (bucketName = 'signatures') => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list()

    if (error) {
      console.error('List error:', error)
      return []
    }

    console.log('Files in bucket:', data)
    return data || []
  } catch (error) {
    console.error('List failed:', error)
    return []
  }
}

// Delete a file
const deleteFile = async (fileName, bucketName = 'signatures') => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove([fileName])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    console.log('File deleted successfully:', data)
    return true
  } catch (error) {
    console.error('Delete failed:', error)
    return false
  }
}

// ============================================================================
// 2. BUCKET OPERATIONS
// ============================================================================

// Get bucket information
const getBucketInfo = async (bucketName = 'signatures') => {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName)

    if (error) {
      console.error('Get bucket error:', error)
      return null
    }

    console.log('Bucket info:', data)
    return data
  } catch (error) {
    console.error('Get bucket failed:', error)
    return null
  }
}

// List all buckets
const listBuckets = async () => {
  try {
    const { data, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error('List buckets error:', error)
      return []
    }

    console.log('All buckets:', data)
    return data || []
  } catch (error) {
    console.error('List buckets failed:', error)
    return []
  }
}

// ============================================================================
// 3. ADVANCED OPERATIONS
// ============================================================================

// Upload with custom metadata
const uploadWithMetadata = async (file, metadata, bucketName = 'signatures') => {
  try {
    const fileName = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        metadata: metadata
      })

    if (error) {
      console.error('Upload with metadata error:', error)
      return null
    }

    console.log('File uploaded with metadata:', data)
    return data
  } catch (error) {
    console.error('Upload with metadata failed:', error)
    return null
  }
}

// Update file metadata
const updateFileMetadata = async (fileName, metadata, bucketName = 'signatures') => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .update(fileName, {
        metadata: metadata
      })

    if (error) {
      console.error('Update metadata error:', error)
      return null
    }

    console.log('Metadata updated:', data)
    return data
  } catch (error) {
    console.error('Update metadata failed:', error)
    return null
  }
}

// Move/rename a file
const moveFile = async (oldPath, newPath, bucketName = 'signatures') => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .move(oldPath, newPath)

    if (error) {
      console.error('Move file error:', error)
      return null
    }

    console.log('File moved successfully:', data)
    return data
  } catch (error) {
    console.error('Move file failed:', error)
    return null
  }
}

// ============================================================================
// 4. REAL-WORLD EXAMPLES
// ============================================================================

// Example: Upload user profile picture
const uploadProfilePicture = async (userId, file) => {
  try {
    const fileName = `profile_${userId}_${Date.now()}.jpg`
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true, // Overwrite if exists
        metadata: {
          userId: userId,
          uploadedAt: new Date().toISOString(),
          type: 'profile-picture'
        }
      })

    if (error) {
      console.error('Profile picture upload error:', error)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return {
      fileData: data,
      publicUrl: publicUrl
    }
  } catch (error) {
    console.error('Profile picture upload failed:', error)
    return null
  }
}

// Example: Upload document with organization context
const uploadDocument = async (organizationId, file, documentType) => {
  try {
    const fileName = `${documentType}_${organizationId}_${Date.now()}.pdf`
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        metadata: {
          organizationId: organizationId,
          documentType: documentType,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'current-user-id' // You'd get this from auth
        }
      })

    if (error) {
      console.error('Document upload error:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Document upload failed:', error)
    return null
  }
}

// Example: Clean up old files
const cleanupOldFiles = async (bucketName, daysOld = 30) => {
  try {
    // List all files
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list()

    if (error) {
      console.error('List files error:', error)
      return
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const filesToDelete = files.filter(file => {
      const fileDate = new Date(file.created_at)
      return fileDate < cutoffDate
    })

    if (filesToDelete.length === 0) {
      console.log('No old files to delete')
      return
    }

    const fileNames = filesToDelete.map(file => file.name)
    
    const { data, error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove(fileNames)

    if (deleteError) {
      console.error('Delete old files error:', deleteError)
      return
    }

    console.log(`Deleted ${filesToDelete.length} old files`)
    return data
  } catch (error) {
    console.error('Cleanup failed:', error)
  }
}

// ============================================================================
// 5. ERROR HANDLING AND VALIDATION
// ============================================================================

// Validate file before upload
const validateFile = (file, maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
  const errors = []

  if (!file) {
    errors.push('No file provided')
    return errors
  }

  if (file.size > maxSize) {
    errors.push(`File size (${file.size} bytes) exceeds maximum allowed size (${maxSize} bytes)`)
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type (${file.type}) is not allowed. Allowed types: ${allowedTypes.join(', ')}`)
  }

  return errors
}

// Safe upload with validation
const safeUpload = async (file, bucketName = 'signatures') => {
  // Validate file
  const validationErrors = validateFile(file)
  if (validationErrors.length > 0) {
    console.error('File validation failed:', validationErrors)
    return { success: false, errors: validationErrors }
  }

  // Check bucket exists
  const bucketInfo = await getBucketInfo(bucketName)
  if (!bucketInfo) {
    return { success: false, errors: ['Bucket not found'] }
  }

  // Upload file
  const uploadResult = await uploadFile(file, bucketName)
  if (!uploadResult) {
    return { success: false, errors: ['Upload failed'] }
  }

  return { success: true, data: uploadResult }
}

// ============================================================================
// 6. USAGE EXAMPLES
// ============================================================================

// Example usage in a React component
/*
import React, { useState } from 'react'

const FileUploadComponent = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploading(true)
    
    try {
      const result = await safeUpload(file, 'documents')
      
      if (result.success) {
        setUploadedFiles(prev => [...prev, result.data])
        console.log('File uploaded successfully')
      } else {
        console.error('Upload failed:', result.errors)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input 
        type="file" 
        onChange={handleFileUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      
      <div>
        <h3>Uploaded Files:</h3>
        {uploadedFiles.map((file, index) => (
          <div key={index}>
            <p>File: {file.path}</p>
            <p>Size: {file.metadata?.size} bytes</p>
          </div>
        ))}
      </div>
    </div>
  )
}
*/

export {
  uploadFile,
  downloadFile,
  getPublicUrl,
  listFiles,
  deleteFile,
  getBucketInfo,
  listBuckets,
  uploadWithMetadata,
  updateFileMetadata,
  moveFile,
  uploadProfilePicture,
  uploadDocument,
  cleanupOldFiles,
  validateFile,
  safeUpload
} 