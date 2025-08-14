import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Debug: Log Supabase config at startup
console.log('[Supabase] URL:', supabaseUrl)
console.log('[Supabase] Anon Key present:', !!supabaseAnonKey && supabaseAnonKey !== 'your-anon-key')

if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  throw new Error('[Supabase] ERROR: VITE_SUPABASE_URL is missing or default! Check your .env or environment variables.')
}
if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  throw new Error('[Supabase] ERROR: VITE_SUPABASE_ANON_KEY is missing or default! Check your .env or environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Set user context for RLS
export const setUserContext = async (userId: string) => {
  // This will set the context variable for the current session
  // Supabase Postgres must have the set_config function available
  try {
    const { error } = await supabase.rpc('set_config', {
      setting_name: 'app.current_user_id',
      setting_value: userId,
      is_local: true
    });
    if (error) {
      console.error('Error setting user context:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception setting user context:', err);
    return false;
  }
};

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