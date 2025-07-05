# Admin Workflow Guide

This guide explains how to use the admin dashboard to review, approve, reject, and comment on submitted SGLD forms.

## Table of Contents
1. [Setup](#setup)
2. [Admin Dashboard Features](#admin-dashboard-features)
3. [Workflow Process](#workflow-process)
4. [User Roles](#user-roles)
5. [Database Schema](#database-schema)
6. [Troubleshooting](#troubleshooting)

## Setup

### 1. Create Admin User
Run the following SQL in your Supabase dashboard:

```sql
-- Create an admin user
INSERT INTO users (email, full_name, password_hash, role, created_at)
VALUES (
    'admin@sgld.com',
    'SGLD Administrator',
    'admin123', -- Simple password for demo
    'admin',
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    full_name = 'SGLD Administrator';
```

### 2. Add Admin Fields to Database
Run the following SQL to add admin decision fields:

```sql
-- Add admin decision fields to forms table
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS admin_decision VARCHAR(10) CHECK (admin_decision IN ('approve', 'reject')),
ADD COLUMN IF NOT EXISTS admin_comments TEXT,
ADD COLUMN IF NOT EXISTS admin_decision_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_decision_by UUID REFERENCES users(id);
```

### 3. Access Admin Dashboard
- Login with admin credentials
- Navigate to `/admin` in your browser
- Or click "Admin Dashboard" link from the main dashboard

## Admin Dashboard Features

### 📊 Statistics Overview
- **Total Forms**: All forms in the system
- **Pending Review**: Forms submitted but not yet reviewed
- **Approved**: Forms that have been approved
- **Rejected**: Forms that have been rejected

### 🔍 Filtering and Search
- **Status Filter**: Filter by All, Pending, Approved, or Rejected
- **Search**: Search by organization name or student name
- **Real-time Updates**: Dashboard updates automatically

### 📋 Form Management
- **View Forms**: Click "View" to see complete form details
- **Review Forms**: Click "Review" for pending forms
- **Download PDFs**: Download approved forms as PDFs
- **Decision Tracking**: See admin decisions and comments

## Workflow Process

### 1. Student Submits Form
1. Student fills out SGLD form
2. Student clicks "Submit Form"
3. Form status changes to "submitted"
4. Form appears in admin dashboard under "Pending Review"

### 2. Admin Reviews Form
1. Admin logs into admin dashboard
2. Admin sees pending forms in the list
3. Admin clicks "Review" button on a form
4. Admin views complete form details

### 3. Admin Makes Decision
1. Admin opens review modal
2. Admin chooses "Approve" or "Reject"
3. Admin adds optional comments explaining decision
4. Admin clicks "Submit Decision"

### 4. Student Sees Decision
1. Form status updates to "approved" or "rejected"
2. Student can view form to see admin decision
3. Student sees admin comments and decision date
4. Approved forms can be downloaded as PDF

## User Roles

### Student Role
- Can create and edit forms
- Can submit forms for review
- Can view admin decisions and comments
- Can download approved forms as PDFs
- Cannot access admin dashboard

### Admin Role
- Can view all forms in the system
- Can approve or reject submitted forms
- Can add comments to decisions
- Can download any form as PDF
- Can access admin dashboard at `/admin`

## Database Schema

### Forms Table - Admin Fields
```sql
-- Admin decision fields
admin_decision VARCHAR(10) CHECK (admin_decision IN ('approve', 'reject'))
admin_comments TEXT
admin_decision_date TIMESTAMP WITH TIME ZONE
admin_decision_by UUID REFERENCES users(id)
```

### Users Table - Role Field
```sql
-- User role for access control
role VARCHAR(20) DEFAULT 'student'
```

### Form Status Flow
```
draft → submitted → approved/rejected
```

## Admin Dashboard Components

### 1. Statistics Cards
- Real-time counts of forms by status
- Visual indicators with icons and colors
- Quick overview of system activity

### 2. Filter and Search
- Dropdown filter for form status
- Search box for organization/student names
- Real-time filtering without page reload

### 3. Forms List
- Each form shows:
  - Organization name
  - Student name
  - Submission date
  - Current status
  - Admin comments (if any)
  - Action buttons

### 4. Review Modal
- Radio buttons for approve/reject decision
- Text area for admin comments
- Submit and cancel buttons
- Form validation

## Admin Actions

### Approve Form
1. Click "Review" on a pending form
2. Select "Approve" radio button
3. Add optional comments
4. Click "Submit Decision"
5. Form status changes to "approved"
6. Student can download PDF

### Reject Form
1. Click "Review" on a pending form
2. Select "Reject" radio button
3. **Required**: Add comments explaining rejection
4. Click "Submit Decision"
5. Form status changes to "rejected"
6. Student sees rejection reason

### View Form Details
1. Click "View" on any form
2. See complete form with all sections
3. View admin decision information (if any)
4. Download PDF (for approved forms)

## Student Experience

### After Submission
- Form shows "Submitted" status
- Student waits for admin review
- Can view form but cannot edit

### After Admin Decision
- Form shows "Approved" or "Rejected" status
- Student sees admin comments
- Student sees decision date
- Approved forms can be downloaded as PDF

### Viewing Decisions
- Admin decision section appears on form view
- Shows decision (✅ Approved / ❌ Rejected)
- Shows admin comments in a highlighted box
- Shows decision date and time

## Security Features

### Role-Based Access
- Only users with `role = 'admin'` can access `/admin`
- Students cannot access admin dashboard
- Admin decisions are tracked with user ID

### Data Integrity
- Admin decision fields are properly constrained
- Decision dates are automatically recorded
- All actions are logged with admin user ID

## Troubleshooting

### Common Issues

#### 1. Admin Dashboard Not Accessible
**Problem**: Getting "Access denied" message
**Solution**: 
- Ensure user has `role = 'admin'` in database
- Check user authentication status
- Verify admin user was created properly

#### 2. Forms Not Appearing
**Problem**: No forms showing in admin dashboard
**Solution**:
- Check if forms have `status = 'submitted'`
- Verify database connection
- Check RLS policies for admin access

#### 3. Decision Not Saving
**Problem**: Admin decision not being recorded
**Solution**:
- Ensure admin fields were added to database
- Check for database errors in console
- Verify admin user ID is valid

#### 4. PDF Download Not Working
**Problem**: PDF download fails for approved forms
**Solution**:
- Check if form status is "approved"
- Verify PDF generator component is working
- Check browser console for errors

### Database Queries for Debugging

#### Check Admin Users
```sql
SELECT id, email, full_name, role 
FROM users 
WHERE role = 'admin';
```

#### Check Form Status
```sql
SELECT id, organization_name, status, admin_decision, admin_comments
FROM forms 
ORDER BY submitted_at DESC;
```

#### Check Admin Decisions
```sql
SELECT 
    f.id,
    f.organization_name,
    f.status,
    f.admin_decision,
    f.admin_comments,
    f.admin_decision_date,
    u.full_name as admin_name
FROM forms f
LEFT JOIN users u ON f.admin_decision_by = u.id
WHERE f.admin_decision IS NOT NULL
ORDER BY f.admin_decision_date DESC;
```

## Best Practices

### For Admins
1. **Review Promptly**: Check for new submissions regularly
2. **Provide Clear Feedback**: Use comments to explain decisions
3. **Be Consistent**: Apply similar standards across all reviews
4. **Document Decisions**: Comments help track decision rationale

### For Students
1. **Submit Complete Forms**: Ensure all required fields are filled
2. **Check Status**: Monitor form status after submission
3. **Read Comments**: Review admin feedback carefully
4. **Download Approved Forms**: Keep PDF copies for records

## File Structure

```
src/
├── components/
│   ├── AdminDashboard.tsx      # Main admin interface
│   ├── Dashboard.tsx           # Student dashboard (updated)
│   ├── SGLDForm.tsx           # Form component (updated)
│   └── PDFGenerator.tsx       # PDF generation
├── contexts/
│   └── AuthContext.tsx        # Authentication (updated)
└── App.tsx                    # Routing (updated)
```

The admin workflow provides a complete system for managing SGLD form submissions with proper role-based access, decision tracking, and user feedback. 