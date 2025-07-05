# Supabase Setup Guide

## Fix "Failed to fetch" Error

The "Failed to fetch" error occurs because the Supabase configuration is using placeholder values instead of real credentials.

## Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 2: Create Environment File

Create a file named `.env.local` in your project root with the following content:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace the placeholder values with your actual Supabase credentials.**

## Step 3: Restart Development Server

After creating the `.env.local` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## Step 4: Verify Connection

The app should now connect to Supabase properly. You can verify by:

1. Opening browser developer tools (F12)
2. Going to the Console tab
3. Looking for "Supabase connection test successful" messages

## Troubleshooting

### If you still get "Failed to fetch":

1. **Check your internet connection**
2. **Verify Supabase project is active** (not paused)
3. **Check browser console for CORS errors**
4. **Ensure environment variables are loaded** (restart dev server)

### Common Issues:

- **Wrong URL format**: Make sure it's `https://your-project-id.supabase.co`
- **Wrong key**: Use the `anon public` key, not the `service_role` key
- **CORS issues**: Ensure your Supabase project allows requests from your domain

## Alternative: Quick Test

If you want to test with a temporary setup, you can modify `src/lib/supabase.ts` temporarily:

```typescript
const supabaseUrl = 'https://your-actual-project-id.supabase.co'
const supabaseAnonKey = 'your-actual-anon-key'
```

**Remember to use environment variables for production!**

## Security Note

- Never commit your `.env.local` file to version control
- The `.env.local` file is already in `.gitignore`
- Use different keys for development and production 