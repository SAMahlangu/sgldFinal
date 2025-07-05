import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import PDFGenerator from './PDFGenerator'
import { Plus, FileText, Calendar, Edit, Eye, LogOut, Download } from 'lucide-react'

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
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const [forms, setForms] = useState<FormData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    if (!user) return

    console.log('Fetching forms for user:', user.id)

    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching forms:', error)
    } else {
      console.log('Forms fetched for user:', user.id, 'Count:', data?.length || 0)
      setForms(data || [])
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'submitted':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SGLD Project Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.full_name}</p>
              {user?.role === 'admin' && (
                <a
                  href="/admin"
                  className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Admin Dashboard
                </a>
              )}
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
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Project Forms</h2>
            <a
              href="/form/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Form
            </a>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your forms...</p>
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first project form.</p>
              <a
                href="/form/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Form
              </a>
            </div>
          ) : (
            <div className="grid gap-4">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {form.organization_name || 'Untitled Project'}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Created: {formatDate(form.created_at)}</span>
                        </div>
                        {form.submitted_at && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Submitted: {formatDate(form.submitted_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(form.status)}`}>
                      {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <a
                      href={`/form/${form.id}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </a>
                    {form.status === 'draft' && (
                      <a
                        href={`/form/${form.id}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </a>
                    )}
                    {form.status === 'submitted' && (
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
        </div>
      </main>
    </div>
  )
}

export default Dashboard