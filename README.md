# SGLD Student Project Planning System

A comprehensive web application for managing Student Government and Leadership Development (SGLD) project planning forms.

## Features

### 🔐 Authentication System
- **User Registration**: New users can create accounts with email and password
- **User Login**: Secure authentication with password hashing
- **Session Management**: Persistent login sessions using localStorage
- **Password Security**: Simple hashing for demo (use bcrypt in production)

### 📋 Project Management
- **Dashboard**: Overview of all project forms with status tracking
- **Form Creation**: Comprehensive SGLD project planning forms
- **Form Editing**: Edit draft forms before submission
- **Form Viewing**: View submitted forms in read-only mode

### 📝 Comprehensive Form Sections
- Basic project information
- Proposed dates and timelines
- Activity details and objectives
- SWOT analysis
- Venue and logistics planning
- Task team and guest lists
- Budget management (income/expenditure)
- Digital signature capture

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Form Management**: React Hook Form
- **Build Tool**: Vite
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations in the `supabase/migrations/` folder
   - Get your project URL and anon key

4. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Usage

### Demo Account
- **Email**: student@example.com
- **Password**: student123

### User Registration
1. Navigate to `/register`
2. Fill in your full name, email, and password
3. Click "Create Account"
4. You'll be automatically logged in and redirected to the dashboard

### User Login
1. Navigate to `/login` (or just `/`)
2. Enter your email and password
3. Click "Sign In"
4. Access your dashboard with all your forms

### Creating Forms
1. From the dashboard, click "Create New Form"
2. Fill in all required sections
3. Save as draft or submit the form
4. View and edit your forms from the dashboard

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (Text, Unique)
- `full_name` (Text)
- `password_hash` (Text)
- `role` (Text, Default: 'student')
- `created_at` (Timestamp)

### Forms Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- All SGLD form fields (Text and JSONB)
- `status` (Text, Default: 'draft')
- `created_at` and `submitted_at` (Timestamps)

## Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Password Hashing**: Passwords are hashed before storage
- **Session Management**: Secure user sessions
- **Form Validation**: Client-side and server-side validation

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Project Structure
```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── LoginForm.tsx    # Login page
│   ├── RegisterForm.tsx # Registration page
│   ├── SGLDForm.tsx     # Main form component
│   ├── SignaturePad.tsx # Digital signature
│   └── AuthNav.tsx      # Auth navigation
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication state
├── lib/                 # Utility libraries
│   └── supabase.ts      # Supabase client
└── App.tsx              # Main app component
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository. 