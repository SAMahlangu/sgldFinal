import React, { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { supabase } from '../lib/supabase'
import { Pen, RotateCcw, Save, Upload, AlertCircle } from 'lucide-react'

interface SignaturePadProps {
  onSignatureSave: (url: string) => void
  initialSignature?: string
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureSave, initialSignature }) => {
  const signatureRef = useRef<SignatureCanvas>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  const clearSignature = () => {
    signatureRef.current?.clear()
    setError('')
    setSuccess('')
  }

  const saveSignature = async () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      setError('Please provide a signature first')
      return
    }

    setIsUploading(true)
    setError('')
    setSuccess('')

    try {
      console.log('Starting signature upload...')
      
      // Check authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('Current user:', user)
      if (authError) {
        console.error('Auth error:', authError)
        setError(`Authentication error: ${authError.message}`)
        return
      }
      
      const canvas = signatureRef.current.getCanvas()
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png')
      })

      console.log('Canvas converted to blob, size:', blob.size)

      const fileName = `signature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`
      console.log('Uploading file:', fileName)

      // Test storage connection first
      console.log('Testing storage connection...')
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('signatures')
      if (bucketError) {
        console.error('Bucket error:', bucketError)
        setError(`Storage bucket error: ${bucketError.message}`)
        return
      }
      console.log('Bucket info:', bucketData)

      const { data, error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError(`Upload failed: ${uploadError.message}`)
        return
      }

      console.log('File uploaded successfully:', data)

      const { data: { publicUrl } } = supabase.storage
        .from('signatures')
        .getPublicUrl(fileName)

      console.log('Public URL generated:', publicUrl)

      // Call the callback to save the URL
      onSignatureSave(publicUrl)
      
      setSuccess('Signature saved successfully!')
      console.log('Signature save callback completed')
      
    } catch (error) {
      console.error('Error saving signature:', error)
      setError(`Error saving signature: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center space-x-2 mb-2">
          <Pen className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Student Signature</span>
        </div>
        
        {initialSignature ? (
          <div className="text-center">
            <img src={initialSignature} alt="Signature" className="mx-auto mb-2 max-h-24 border rounded" />
            <p className="text-sm text-green-600">Signature saved</p>
            <button
              type="button"
              onClick={() => {
                signatureRef.current?.clear()
                onSignatureSave('')
              }}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Draw new signature
            </button>
          </div>
        ) : (
          <>
            <div className="border border-gray-300 rounded bg-white">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  width: 400,
                  height: 150,
                  className: 'w-full h-32'
                }}
                backgroundColor="white"
              />
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <button
                type="button"
                onClick={clearSignature}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Clear</span>
              </button>
              
              <button
                type="button"
                onClick={saveSignature}
                disabled={isUploading}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Signature</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
          <Save className="h-5 w-5" />
          <span className="text-sm">{success}</span>
        </div>
      )}
    </div>
  )
}

export default SignaturePad