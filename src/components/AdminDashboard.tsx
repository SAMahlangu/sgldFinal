import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import PDFGenerator from './PDFGenerator'
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Filter, 
  Search,
  Calendar,
  Users,
  FileText,
  LogOut,
  Clock,
  AlertCircle,
  Send
} from 'lucide-react'

interface FormData {
  id: string
  organization_name: string
  status: string
  created_at: string
  submitted_at: string | null
  date_submission: string
  proposed_dates: Array<{ date: string; description: string }>
  organization_goal: string
  activity_concept: string
  activity_objective: string
  targeted_population: string
  empowerment_opportunities: string
  marketing_opportunities: string
  accreditation_certification: string
  swot_analysis: {
    strengths: string
    weaknesses: string
    opportunities: string
    threats: string
  }
  proposed_venues: Array<{ venue: string; capacity: string; cost: string }>
  task_team: Array<{ name: string; portfolio: string }>
  guest_list: Array<{ name: string; organization: string; contact: string }>
  proposed_programme: string
  task_delegation: Array<{
    activity: string
    person_responsible: string
    assignment_date: string
    target_date: string
    contact_person: string
    telephone: string
  }>
  budget_expenditure: Array<{ description: string; amount: number }>
  budget_income: Array<{ description: string; amount: number }>
  facilitator_recommendation: string
  evaluation: string
  user_id: string
  admin_decision?: string
  admin_comments?: string
  admin_decision_date?: string
  admin_decision_by?: string
  admin_signature_url?: string
}

interface User {
  id: string
  full_name: string
  email: string
  role: string
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const [forms, setForms] = useState<FormData[]>([])
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [selectedForm, setSelectedForm] = useState<FormData | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [decision, setDecision] = useState<'approve' | 'reject' | ''>('')
  const [comments, setComments] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState<{ [key: string]: User }>({})
  const [error, setError] = useState<string | null>(null)

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking admin authentication...')
        console.log('Current user:', user)
        
        if (!user) {
          console.log('No user found, redirecting to login')
          setAuthLoading(false)
          return
        }

        if (user.role !== 'admin') {
          console.log('User is not admin, redirecting to dashboard')
          alert('Access denied. Admin privileges required.')
          window.location.href = '/dashboard'
          return
        }

        // Verify user still exists in database
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, full_name, role')
          .eq('id', user.id)
          .eq('role', 'admin')
          .limit(1)

        if (userError) {
          console.error('Error verifying admin user:', userError)
          setError('Authentication error. Please log in again.')
          setAuthLoading(false)
          return
        }

        if (!userData || userData.length === 0) {
          console.error('Admin user not found in database')
          setError('Admin user not found. Please log in again.')
          setAuthLoading(false)
          return
        }

        console.log('Admin authentication verified:', userData[0])
        setAuthLoading(false)
        
        // Now fetch data
        await fetchForms()
        await fetchUsers()
      } catch (error) {
        console.error('Authentication check error:', error)
        setError('Authentication error. Please log in again.')
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [user])

  const fetchForms = async () => {
    try {
      console.log('Fetching forms for admin...')
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (error) {
        console.error('Error fetching forms:', error)
        if (error.message?.includes('auth') || error.message?.includes('session')) {
          setError('Authentication error. Please log in again.')
        } else {
          setError('Error loading forms. Please try again.')
        }
      } else {
        console.log('Forms fetched successfully:', data?.length || 0)
        setForms(data || [])
      }
    } catch (error) {
      console.error('Error in fetchForms:', error)
      setError('Error loading forms. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      console.log('Fetching users for admin...')
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, role')

      if (error) {
        console.error('Error fetching users:', error)
        if (error.message?.includes('auth') || error.message?.includes('session')) {
          setError('Authentication error. Please log in again.')
        }
      } else {
        console.log('Users fetched successfully:', data?.length || 0)
        const userMap: { [key: string]: User } = {}
        data?.forEach(user => {
          userMap[user.id] = user
        })
        setUsers(userMap)
      }
    } catch (error) {
      console.error('Error in fetchUsers:', error)
    }
  }

  const handleDecision = async () => {
    if (!selectedForm || !decision || !user) {
      alert('Missing required information for decision')
      return
    }

    try {
      console.log('Submitting admin decision...')
      const updateData: any = {
        admin_decision: decision,
        admin_comments: comments,
        admin_decision_date: new Date().toISOString(),
        admin_decision_by: user.id,
        status: decision === 'approve' ? 'approved' : 'rejected',
      }

      const { error } = await supabase
        .from('forms')
        .update(updateData)
        .eq('id', selectedForm.id)

      if (error) {
        console.error('Error updating form:', error)
        if (error.message?.includes('auth') || error.message?.includes('session')) {
          alert('Authentication error. Please log in again.')
        } else {
          alert('Error updating form decision')
        }
        return
      }

      // Update local state
      setForms(forms.map(form => 
        form.id === selectedForm.id 
          ? { ...form, ...updateData }
          : form
      ))

      setShowModal(false)
      setSelectedForm(null)
      setDecision('')
      setComments('')
      alert(`Form ${decision === 'approve' ? 'approved' : 'rejected'} successfully`)
    } catch (error) {
      console.error('Error:', error)
      alert('Error updating form decision')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-4 w-4" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      case 'draft':
        return <FileText className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const filteredForms = forms.filter(form => {
    const matchesFilter = filter === 'all' || form.status === filter
    const matchesSearch = form.organization_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         users[form.user_id]?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    total: forms.length,
    pending: forms.filter(f => f.status === 'submitted').length,
    approved: forms.filter(f => f.status === 'approved').length,
    rejected: forms.filter(f => f.status === 'rejected').length
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              logout()
              window.location.href = '/login'
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Show access denied if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.full_name}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Forms</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-semibold text-blue-600">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-green-600">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-semibold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Forms</option>
                  <option value="submitted">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by organization or student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Forms List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading forms...</p>
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
            <p className="text-gray-600">No forms match your current filters.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {form.organization_name || 'Untitled Project'}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(form.status)}`}>
                        {getStatusIcon(form.status)}
                        <span className="ml-1">{form.status.charAt(0).toUpperCase() + form.status.slice(1)}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Submitted by: {users[form.user_id]?.full_name || 'Unknown User'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted: {form.submitted_at ? formatDate(form.submitted_at) : 'Not submitted'}</span>
                      </div>
                    </div>

                    {form.admin_comments && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Admin Comments:</strong> {form.admin_comments}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <a
                    href={`/form/${form.id}`}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </a>
                  
                  {form.status === 'submitted' && (
                    <button
                      onClick={() => {
                        setSelectedForm(form)
                        setShowModal(true)
                      }}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Review
                    </button>
                  )}
                  
                  {form.status === 'approved' && (
                    <PDFGenerator 
                      formData={form}
                      onComplete={() => {}}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Review Modal */}
      {showModal && selectedForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Review Form: {selectedForm.organization_name}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decision
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="approve"
                      checked={decision === 'approve'}
                      onChange={(e) => setDecision(e.target.value as 'approve' | 'reject')}
                      className="mr-2"
                    />
                    <span className="text-green-600">Approve</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="reject"
                      checked={decision === 'reject'}
                      onChange={(e) => setDecision(e.target.value as 'approve' | 'reject')}
                      className="mr-2"
                    />
                    <span className="text-red-600">Reject</span>
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add comments about your decision..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedForm(null)
                    setDecision('')
                    setComments('')
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDecision}
                  disabled={!decision}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard 