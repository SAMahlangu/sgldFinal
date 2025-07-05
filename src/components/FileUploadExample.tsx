import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Upload, Download, Trash2, File, AlertCircle, CheckCircle } from 'lucide-react'

interface FileInfo {
  name: string
  path: string
  size: number
  created_at: string
  publicUrl?: string
}

const FileUploadExample: React.FC = () => {
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<FileInfo[]>([])
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  // Upload a file
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      // Validate file
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB')
        return
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setError('File type not allowed. Please upload JPEG, PNG, GIF, or PDF files.')
        return
      }

      // Generate unique filename
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name}`

      // Upload to storage
      const { data, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
            fileType: file.type,
            fileSize: file.size
          }
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError(`Upload failed: ${uploadError.message}`)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

      // Add to files list
      const newFile: FileInfo = {
        name: file.name,
        path: fileName,
        size: file.size,
        created_at: new Date().toISOString(),
        publicUrl: publicUrl
      }

      setFiles(prev => [...prev, newFile])
      setSuccess('File uploaded successfully!')
      console.log('File uploaded:', data)

    } catch (error) {
      console.error('Upload error:', error)
      setError(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  // Download a file
  const handleDownload = async (file: FileInfo) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(file.path)

      if (error) {
        console.error('Download error:', error)
        setError(`Download failed: ${error.message}`)
        return
      }

      // Create download link
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setSuccess('File downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      setError(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Delete a file
  const handleDelete = async (file: FileInfo) => {
    try {
      const { error } = await supabase.storage
        .from('documents')
        .remove([file.path])

      if (error) {
        console.error('Delete error:', error)
        setError(`Delete failed: ${error.message}`)
        return
      }

      // Remove from files list
      setFiles(prev => prev.filter(f => f.path !== file.path))
      setSuccess('File deleted successfully!')
    } catch (error) {
      console.error('Delete error:', error)
      setError(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // List files in bucket
  const handleListFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .list()

      if (error) {
        console.error('List error:', error)
        setError(`Failed to list files: ${error.message}`)
        return
      }

      // Convert to FileInfo format
      const fileList: FileInfo[] = data.map(file => ({
        name: file.name,
        path: file.name,
        size: file.metadata?.size || 0,
        created_at: file.created_at,
        publicUrl: supabase.storage.from('documents').getPublicUrl(file.name).data.publicUrl
      }))

      setFiles(fileList)
      setSuccess(`Found ${fileList.length} files`)
    } catch (error) {
      console.error('List error:', error)
      setError(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">File Upload Example</h2>
        
        {/* Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload File
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              accept="image/*,.pdf"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              onClick={handleListFiles}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              List Files
            </button>
          </div>
          
          {uploading && (
            <div className="mt-2 flex items-center space-x-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Uploading...</span>
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span>{success}</span>
          </div>
        )}

        {/* Files List */}
        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files</h3>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownload(file)}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Storage Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Storage Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Bucket:</p>
            <p className="font-medium">documents</p>
          </div>
          <div>
            <p className="text-gray-600">Files:</p>
            <p className="font-medium">{files.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Total Size:</p>
            <p className="font-medium">
              {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Max File Size:</p>
            <p className="font-medium">5MB</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileUploadExample 