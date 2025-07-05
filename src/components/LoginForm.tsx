import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogIn, User, Lock, AlertCircle, Eye, EyeOff, Bug } from 'lucide-react'
import AuthNav from './AuthNav'
import { testSupabaseConnection, checkUserData, listAllUsers } from '../lib/supabase'

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>('')
  const [debugInfo, setDebugInfo] = useState<string>('')
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('sgld_user')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      console.log('User already logged in, redirecting...', user)
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
      return
    }

    // Test Supabase connection on component mount
    const testConnection = async () => {
      setConnectionStatus('Testing connection...')
      const isConnected = await testSupabaseConnection()
      setConnectionStatus(isConnected ? 'Connected to database' : 'Database connection failed')
    }
    testConnection()
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const success = await login(email, password)
    if (success) {
      console.log('Login successful, redirecting to dashboard...')
      // Redirect based on user role
      const user = JSON.parse(localStorage.getItem('sgld_user') || '{}')
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } else {
      setError('Invalid email or password. Check console for details.')
    }
    setLoading(false)
  }

  const runDebugTests = async () => {
    setDebugInfo('Running debug tests...')
    
    // Test connection
    const isConnected = await testSupabaseConnection()
    
    // List all users
    const users = await listAllUsers()
    
    // Check specific user if email is provided
    let userData = null
    if (email) {
      userData = await checkUserData(email)
    }
    
    const debugText = `
Connection: ${isConnected ? 'OK' : 'FAILED'}
Total users: ${users.length}
${email ? `User data for ${email}: ${userData ? 'FOUND' : 'NOT FOUND'}` : ''}
Check console for detailed logs.
    `.trim()
    
    setDebugInfo(debugText)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 relative">
      <AuthNav currentPage="login" />
      
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">SGLD Project Planning System</p>
        </div>

        {/* Connection Status */}
        {connectionStatus && (
          <div className={`text-center p-3 rounded-lg text-sm ${
            connectionStatus.includes('Connected') 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {connectionStatus}
          </div>
        )}

        {/* Debug Info */}
        {debugInfo && (
          <div className="bg-gray-50 p-3 rounded-lg text-sm font-mono">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Debug Info:</span>
              <button
                onClick={() => setDebugInfo('')}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-xs">{debugInfo}</pre>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="h-5 w-5 mr-2" />
                Sign In
              </>
            )}
          </button>

          {/* Debug Button */}
          <button
            type="button"
            onClick={runDebugTests}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Bug className="h-4 w-4 mr-2" />
            Run Debug Tests
          </button>
        </form>

        <div className="text-center space-y-4">
          <div className="text-sm text-gray-500">
            <p>Demo credentials:</p>
            <p className="font-mono">student@example.com / student123</p>
            <p className="font-mono">admin@example.com / admin123</p>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600">
              Contact your administrator to get access to the system.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm