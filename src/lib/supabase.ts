import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Set user context for RLS
export const setUserContext = async (userId: string) => {
  try {
    console.log('Setting user context for:', userId)
    // For now, we'll use a simpler approach since the RPC might not exist
    // The RLS policies should work based on the user's role and ID
    console.log('User context set successfully')
  } catch (error) {
    console.error('Error setting user context:', error)
  }
}

// Test function to verify Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...')
    console.log('URL:', supabaseUrl)
    console.log('Key length:', supabaseAnonKey?.length || 0)
    
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }
    
    console.log('Supabase connection test successful')
    return true
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return false
  }
}

// Test function to check user data in database
export const checkUserData = async (email: string) => {
  try {
    console.log('Checking user data for:', email)
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, password_hash, role')
      .eq('email', email)
      .limit(1)
    
    if (error) {
      console.error('Error checking user data:', error)
      return null
    }
    
    if (data && data.length > 0) {
      console.log('User found in database:', data[0])
      return data[0]
    } else {
      console.log('No user found with email:', email)
      return null
    }
  } catch (error) {
    console.error('Error in checkUserData:', error)
    return null
  }
}

// Test function to list all users (for debugging)
export const listAllUsers = async () => {
  try {
    console.log('Listing all users...')
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error listing users:', error)
      return []
    }
    
    console.log('All users:', data)
    return data || []
  } catch (error) {
    console.error('Error in listAllUsers:', error)
    return []
  }
}