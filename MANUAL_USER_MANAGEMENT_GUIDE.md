# Manual User Management Guide

## Overview

The SGLD system now uses manual user management instead of self-registration. All users must be added to the database by administrators. This provides better control over who can access the system.

## System Changes Made

### ✅ Removed Components
- Registration form (`RegisterForm.tsx`)
- Registration functionality from `AuthContext.tsx`
- Registration routes from `App.tsx`
- Registration links from `LoginForm.tsx` and `AuthNav.tsx`

### ✅ Updated Components
- `App.tsx`: Now uses React Router with protected routes
- `LoginForm.tsx`: Removed registration link, updated demo credentials
- `AuthNav.tsx`: Simplified to show system name only
- `AuthContext.tsx`: Removed registration function

## User Management Process

### 1. Adding New Users

#### Option A: Using the Password Hash Generator
1. Open `password-hash-generator.html` in your browser
2. Enter the user's password, email, full name, and role
3. Click "Generate Hash" to get the SQL insert statement
4. Copy the generated SQL and run it in your Supabase SQL editor

#### Option B: Manual SQL Insert
```sql
-- Example: Add a student
INSERT INTO users (email, full_name, password_hash, role) 
VALUES ('student@university.edu', 'John Student', '-1234567890', 'student');

-- Example: Add an admin
INSERT INTO users (email, full_name, password_hash, role) 
VALUES ('admin@university.edu', 'Admin User', '-1234567891', 'admin');
```

### 2. Password Hash Generation

The system uses a simple hash function for demo purposes. To generate a hash:

1. **Using the HTML tool**: Open `password-hash-generator.html`
2. **Using the app**: Try logging in with the desired password and check browser console for the hash
3. **Manual calculation**: Use the same algorithm as the app

### 3. User Roles

- **`student`**: Can submit forms, view their own submissions, download PDFs
- **`admin`**: Can view all submissions, approve/reject forms, add comments, access admin dashboard

### 4. Managing Existing Users

#### View All Users
```sql
SELECT id, email, full_name, role, created_at 
FROM users 
ORDER BY created_at;
```

#### Update User Role
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'student@example.com';
```

#### Change User Password
1. Generate new password hash using the tool
2. Update the database:
```sql
UPDATE users 
SET password_hash = 'NEW_HASH_VALUE' 
WHERE email = 'user@example.com';
```

#### Delete User
```sql
DELETE FROM users 
WHERE email = 'user@example.com';
```

## Demo Users

The system includes these demo users:

| Email | Password | Role | Full Name |
|-------|----------|------|-----------|
| `student@example.com` | `student123` | student | Demo Student |
| `admin@example.com` | `admin123` | admin | System Administrator |

## Security Considerations

### ⚠️ Important Notes
1. **Password Hashing**: The current hash function is for demo purposes only. In production, use bcrypt or similar.
2. **Access Control**: Only administrators should have database access to manage users.
3. **Password Policy**: Consider implementing password complexity requirements.
4. **Audit Trail**: Consider adding logging for user management actions.

### 🔒 Best Practices
1. Use strong, unique passwords for each user
2. Regularly review and update user access
3. Remove inactive users
4. Use email addresses as unique identifiers
5. Keep user management logs

## Troubleshooting

### Common Issues

#### User Can't Login
1. Check if user exists in database
2. Verify password hash is correct
3. Check user role is set correctly
4. Ensure RLS policies allow access

#### Admin Can't Access Admin Dashboard
1. Verify user role is set to 'admin'
2. Check admin route protection in `App.tsx`
3. Ensure user is properly authenticated

#### Database Connection Issues
1. Check Supabase connection settings
2. Verify RLS policies are in place
3. Test connection using the debug tools in login form

### Debug Tools

The login form includes debug tools that can help:
- Test database connection
- List all users
- Check specific user data
- Verify authentication flow

## Migration from Self-Registration

If you had users who registered themselves before this change:

1. **Export existing users**: Get list of all registered users
2. **Verify data**: Check that all users have proper roles assigned
3. **Update if needed**: Modify any users that need role changes
4. **Test access**: Ensure all existing users can still login

## File Structure

```
project/
├── src/
│   ├── components/
│   │   ├── LoginForm.tsx          # Updated - no registration
│   │   ├── AuthNav.tsx            # Updated - simplified
│   │   └── RegisterForm.tsx       # ❌ Removed
│   ├── contexts/
│   │   └── AuthContext.tsx        # Updated - no registration
│   └── App.tsx                    # Updated - React Router
├── add-users-manually.sql         # SQL examples
├── password-hash-generator.html   # Hash generation tool
└── MANUAL_USER_MANAGEMENT_GUIDE.md # This guide
```

## Next Steps

1. **Add your users**: Use the provided tools to add your actual users
2. **Test the system**: Verify login works for all users
3. **Set up admin access**: Ensure at least one admin user exists
4. **Train administrators**: Show them how to manage users
5. **Document procedures**: Create internal procedures for user management

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Use the debug tools in the login form
3. Verify database connections and policies
4. Review the troubleshooting section above 