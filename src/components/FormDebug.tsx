import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, setUserContext } from '../lib/supabase'
import { Bug, Database, User, AlertCircle } from 'lucide-react'

interface TestResults {
  user: {
    exists: boolean
    id?: string
    email?: string
    role?: string
  } | null
  database: {
    connected: boolean
    error: string | null
  } | null
  policies: {
    canRead: boolean
    error: string | null
    hasForms: boolean | null
  } | null
  context: {
    success: boolean
    error?: string
  } | null
}

interface FormDebugProps {
  onTestComplete: (results: TestResults) => void
}

const FormDebug: React.FC<FormDebugProps> = ({ onTestComplete }) => {
  const { user } = useAuth()
  const [isTesting, setIsTesting] = useState(false)
  const [results, setResults] = useState<TestResults | null>(null)

  const runTests = async () => {
    setIsTesting(true)
    const testResults: TestResults = {
      user: null,
      database: null,
      policies: null,
      context: null
    }

    try {
      // Test 1: User authentication
      console.log('=== Testing User Authentication ===')
      testResults.user = {
        exists: !!user,
        id: user?.id,
        email: user?.email,
        role: user?.role
      }
      console.log('User test result:', testResults.user)

      // Test 2: Database connection
      console.log('=== Testing Database Connection ===')
      const { data: dbData, error: dbError } = await supabase
        .from('forms')
        .select('count')
        .limit(1)
      
      testResults.database = {
        connected: !dbError,
        error: dbError?.message || null
      }
      console.log('Database test result:', testResults.database)

      // Test 3: User context
      console.log('=== Testing User Context ===')
      if (user) {
        try {
          await setUserContext(user.id)
          testResults.context = { success: true }
          console.log('User context set successfully')
        } catch (contextError) {
          testResults.context = { 
            success: false, 
            error: contextError instanceof Error ? contextError.message : 'Unknown error' 
          }
          console.error('User context error:', contextError)
        }
      }

      // Test 4: Form policies
      console.log('=== Testing Form Policies ===')
      if (user) {
        try {
          const { data: policyData, error: policyError } = await supabase
            .from('forms')
            .select('id')
            .eq('user_id', user.id)
            .limit(1)
          
          testResults.policies = {
            canRead: !policyError,
            error: policyError?.message || null,
            hasForms: policyData && policyData.length > 0
          }
          console.log('Policy test result:', testResults.policies)
        } catch (policyError) {
          testResults.policies = {
            canRead: false,
            error: policyError instanceof Error ? policyError.message : 'Unknown error',
            hasForms: null
          }
        }
      }

    } catch (error) {
      console.error('Debug test error:', error)
    }

    setResults(testResults)
    onTestComplete(testResults)
    setIsTesting(false)
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <div className="flex items-center space-x-2 mb-4">
        <Bug className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900">Form Debug Tools</h3>
      </div>

      <button
        onClick={runTests}
        disabled={isTesting}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isTesting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Running Tests...</span>
          </>
        ) : (
          <>
            <Database className="h-4 w-4" />
            <span>Run Debug Tests</span>
          </>
        )}
      </button>

      {results && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="text-sm">
              User: {results.user?.exists ? '✅ Logged in' : '❌ Not logged in'}
              {results.user?.exists && ` (${results.user.email})`}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span className="text-sm">
              Database: {results.database?.connected ? '✅ Connected' : '❌ Failed'}
              {results.database?.error && ` - ${results.database.error}`}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              Context: {results.context?.success ? '✅ Set' : '❌ Failed'}
              {results.context?.error && ` - ${results.context.error}`}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Bug className="h-4 w-4" />
            <span className="text-sm">
              Policies: {results.policies?.canRead ? '✅ Working' : '❌ Failed'}
              {results.policies?.error && ` - ${results.policies.error}`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default FormDebug 