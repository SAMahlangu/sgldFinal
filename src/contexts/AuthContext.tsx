import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, setUserContext } from '../lib/supabase'

interface User {
  id: string
  email: string
  full_name: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Simple hash function for demo purposes
// In production, use a proper hashing library like bcrypt
const hashPassword = (password: string): string => {
  // This is a simple hash for demo - in production use bcrypt or similar
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString()
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('=== AUTH INITIALIZATION START ===')
        
        // Check if user is stored in localStorage
        const storedUser = localStorage.getItem('sgld_user')
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser)
            console.log('Loading user from localStorage:', userData)
            
            // Verify the stored user still exists in database
            const { data: dbUser, error: dbError } = await supabase
              .from('users')
              .select('id, email, full_name, role')
              .eq('id', userData.id)
              .limit(1)
            
            if (dbError) {
              console.error('Error verifying stored user:', dbError)
              localStorage.removeItem('sgld_user')
              setUser(null)
            } else if (dbUser && dbUser.length > 0) {
              console.log('Stored user verified in database:', dbUser[0])
              setUser(dbUser[0])
              await setUserContext(dbUser[0].id)
            } else {
              console.log('Stored user not found in database, clearing session')
              localStorage.removeItem('sgld_user')
              setUser(null)
            }
          } catch (error) {
            console.error('Error parsing stored user:', error)
            localStorage.removeItem('sgld_user')
            setUser(null)
          }
        } else {
          console.log('No stored user found')
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
        console.log('=== AUTH INITIALIZATION END ===')
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('=== LOGIN DEBUG START ===')
      console.log('Starting login for:', email)
      const hashedPassword = hashPassword(password)
      console.log('Hashed password:', hashedPassword)
      
      // First, let's test the connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (connectionError) {
        console.error('Database connection failed:', connectionError)
        return false
      }
      
      console.log('Database connection successful')
      
      // Now try to find the user
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', hashedPassword)
        .limit(1)

      if (error) {
        console.error('Login query error:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return false
      }

      console.log('Query executed successfully')
      console.log('Users found:', users?.length || 0)

      if (!users || users.length === 0) {
        console.log('No user found with email:', email)
        console.log('Attempted hash:', hashedPassword)
        
        // Let's also check if the user exists with a different hash
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('password_hash, role')
          .eq('email', email)
          .limit(1)
        
        if (checkError) {
          console.error('Error checking existing user:', checkError)
        } else if (existingUser && existingUser.length > 0) {
          console.log('User exists but password hash mismatch')
          console.log('Stored hash:', existingUser[0].password_hash)
          console.log('Attempted hash:', hashedPassword)
          console.log('User role:', existingUser[0].role)
        } else {
          console.log('No user found with this email at all')
        }
        
        console.log('=== LOGIN DEBUG END (FAILED) ===')
        return false
      }

      const userData = users[0]
      console.log('User found successfully:', {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role
      })
      
      const userSession = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role
      }

      console.log('Setting user session:', userSession)
      setUser(userSession)
      localStorage.setItem('sgld_user', JSON.stringify(userSession))
      
      console.log('User context being set...')
      await setUserContext(userData.id)
      
      console.log('Login successful, session created')
      console.log('=== LOGIN DEBUG END (SUCCESS) ===')
      return true
    } catch (error) {
      console.error('Login error (catch block):', error)
      console.log('=== LOGIN DEBUG END (ERROR) ===')
      return false
    }
  }

  const logout = () => {
    console.log('Logging out user:', user?.email)
    setUser(null)
    localStorage.removeItem('sgld_user')
    console.log('User logged out, session cleared')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}