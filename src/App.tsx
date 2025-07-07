import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import SGLDForm from './components/SGLDForm';
import AdminDashboard from './components/AdminDashboard';
import FormArrayTest from './components/FormArrayTest';
import './index.css';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  console.log('ProtectedRoute - user:', user, 'loading:', loading);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Admin Route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return user && user.role === 'admin' ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router basename="/sgld3">
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/form/new" 
              element={
                <ProtectedRoute>
                  <SGLDForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/form/:id" 
              element={
                <ProtectedRoute>
                  <SGLDForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/form" 
              element={
                <ProtectedRoute>
                  <SGLDForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route path="/test" element={<FormArrayTest />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;