# Login Flow Test Script

## Quick Test Steps

### 1. Clear Browser Data
```bash
# Open browser developer tools (F12)
# Go to Application tab → Storage → Clear site data
# Or manually clear localStorage:
localStorage.removeItem('sgld_user')
```

### 2. Test Student Login
1. Navigate to `http://localhost:5173/login`
2. Enter credentials:
   - Email: `student@example.com`
   - Password: `student123`
3. Click "Sign In"
4. **Expected**: Redirect to `/dashboard`

### 3. Test Admin Login
1. Navigate to `http://localhost:5173/login`
2. Enter credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Click "Sign In"
4. **Expected**: Redirect to `/admin`

### 4. Monitor Debug Information
- **AuthDebug Component**: Should show user state in top-right corner
- **Browser Console**: Should show detailed login logs
- **URL**: Should change to correct dashboard

## Expected Console Output

### Student Login Success
```
=== LOGIN DEBUG START ===
Starting login for: student@example.com
Hashed password: -1032466921
Database connection successful
Query executed successfully
Users found: 1
User found successfully: {id: "123", email: "student@example.com", full_name: "Demo Student", role: "student"}
Setting user session: {id: "123", email: "student@example.com", full_name: "Demo Student", role: "student"}
User context being set...
User context set successfully
Login successful, session created
=== LOGIN DEBUG END (SUCCESS) ===
Login successful, redirecting to dashboard...
ProtectedRoute - user: {id: "123", email: "student@example.com", full_name: "Demo Student", role: "student"} loading: false
```

### Admin Login Success
```
=== LOGIN DEBUG START ===
Starting login for: admin@example.com
Hashed password: -969161597
Database connection successful
Query executed successfully
Users found: 1
User found successfully: {id: "456", email: "admin@example.com", full_name: "System Administrator", role: "admin"}
Setting user session: {id: "456", email: "admin@example.com", full_name: "System Administrator", role: "admin"}
User context being set...
User context set successfully
Login successful, session created
=== LOGIN DEBUG END (SUCCESS) ===
Login successful, redirecting to dashboard...
ProtectedRoute - user: {id: "456", email: "admin@example.com", full_name: "System Administrator", role: "admin"} loading: false
```

## Troubleshooting Checklist

### If Login Fails
- [ ] Check browser console for error messages
- [ ] Verify database users exist with correct hashes
- [ ] Check environment variables are set
- [ ] Test database connection using debug tools

### If No Redirect After Success
- [ ] Check AuthDebug component state
- [ ] Verify user role in database
- [ ] Check for JavaScript errors in console
- [ ] Clear browser cache and localStorage

### If Wrong Dashboard
- [ ] Verify user role in database
- [ ] Check AuthDebug component shows correct role
- [ ] Clear localStorage and re-login

## Database Verification Commands

### Check Users Exist
```sql
SELECT email, full_name, role, password_hash 
FROM users 
WHERE email IN ('student@example.com', 'admin@example.com');
```

### Fix Users if Needed
```sql
-- Fix student user
UPDATE users 
SET password_hash = '-1032466921', role = 'student'
WHERE email = 'student@example.com';

-- Fix admin user
UPDATE users 
SET password_hash = '-969161597', role = 'admin'
WHERE email = 'admin@example.com';
```

## Success Indicators

✅ **Login Form**: Accepts credentials without errors
✅ **Console Logs**: Show successful authentication
✅ **AuthDebug Component**: Shows user state
✅ **URL Change**: Redirects to correct dashboard
✅ **Dashboard Loads**: Shows appropriate content for user role

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "No user found" | Run database fix script |
| "Password hash mismatch" | Update password hashes in database |
| "Database connection failed" | Check environment variables |
| "Still on login page" | Clear localStorage and retry |
| "Wrong dashboard" | Check user role in database | 