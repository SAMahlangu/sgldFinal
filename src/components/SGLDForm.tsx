import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { supabase, setUserContext } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import PDFGenerator from './PDFGenerator'
import { Save, Send, Plus, Trash2, ArrowLeft, Calendar } from 'lucide-react'

interface FormData {
  id?: string
  organization_name: string
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
  status: string
  admin_decision?: string
  admin_comments?: string
  admin_decision_date?: string
  admin_decision_by?: string
  admin_signature_url?: string
}

const SGLDForm: React.FC = () => {
  const { id: formId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [submittedFormData, setSubmittedFormData] = useState<FormData | null>(null)
  const [showPDFDownload, setShowPDFDownload] = useState(false)

  // Determine if form should be read-only (admin viewing existing form)
  const isReadOnly = user?.role === 'admin' && formId
  const isAdmin = user?.role === 'admin'
  const backUrl = isAdmin ? '/admin' : '/dashboard'

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      organization_name: '',
      date_submission: new Date().toISOString().split('T')[0],
      proposed_dates: [{ date: '', description: '' }],
      organization_goal: '',
      activity_concept: '',
      activity_objective: '',
      targeted_population: '',
      empowerment_opportunities: '',
      marketing_opportunities: '',
      accreditation_certification: '',
      swot_analysis: {
        strengths: '',
        weaknesses: '',
        opportunities: '',
        threats: ''
      },
      proposed_venues: [{ venue: '', capacity: '', cost: '' }],
      task_team: [{ name: '', portfolio: '' }],
      guest_list: [{ name: '', organization: '', contact: '' }],
      proposed_programme: '',
      task_delegation: [
        {
          activity: '',
          person_responsible: '',
          assignment_date: '',
          target_date: '',
          contact_person: '',
          telephone: ''
        }
      ],
      budget_expenditure: [{ description: '', amount: 0 }],
      budget_income: [{ description: '', amount: 0 }],
      facilitator_recommendation: '',
      evaluation: '',
      status: 'draft'
    }
  })

  const {
    fields: proposedDatesFields,
    append: appendProposedDate,
    remove: removeProposedDate
  } = useFieldArray({ control, name: 'proposed_dates' })

  const {
    fields: venuesFields,
    append: appendVenue,
    remove: removeVenue
  } = useFieldArray({ control, name: 'proposed_venues' })

  const {
    fields: taskTeamFields,
    append: appendTaskTeam,
    remove: removeTaskTeam
  } = useFieldArray({ control, name: 'task_team' })

  const {
    fields: guestListFields,
    append: appendGuest,
    remove: removeGuest
  } = useFieldArray({ control, name: 'guest_list' })

  const {
    fields: taskDelegationFields,
    append: appendTaskDelegation,
    remove: removeTaskDelegation
  } = useFieldArray({ control, name: 'task_delegation' })

  const {
    fields: expenditureFields,
    append: appendExpenditure,
    remove: removeExpenditure
  } = useFieldArray({ control, name: 'budget_expenditure' })

  const {
    fields: incomeFields,
    append: appendIncome,
    remove: removeIncome
  } = useFieldArray({ control, name: 'budget_income' })

  const expenditureValues = watch('budget_expenditure')
  const incomeValues = watch('budget_income')
  const formData = watch()

  const totalExpenditure = expenditureValues?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0
  const totalIncome = incomeValues?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0

  useEffect(() => {
    if (formId) {
      setInitialLoading(true)
      fetchForm()
    } else {
      // For new forms, just test database connection
      testDatabaseConnection()
    }
  }, [formId])

  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...')
      console.log('Current user:', user)
      
      if (!user) {
        console.error('No user found')
        return
      }

      // Test if we can set user context
      await setUserContext(user.id)
      console.log('User context set successfully')

      // Test if we can query the forms table
      const { data, error } = await supabase
        .from('forms')
        .select('count')
        .limit(1)

      if (error) {
        console.error('Database connection test failed:', error)
      } else {
        console.log('Database connection test successful')
      }
    } catch (error) {
      console.error('Database connection test error:', error)
    }
  }

  const fetchForm = async () => {
    if (!formId) return

    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single()

      if (error) throw error

      if (data) {
        console.log('=== FETCHED FORM DATA ===')
        console.log('Fetched Proposed Venues:', data.proposed_venues)
        console.log('Fetched Task Team:', data.task_team)
        console.log('Fetched Guest List:', data.guest_list)
        console.log('Fetched Task Delegation:', data.task_delegation)
        console.log('Fetched Budget Expenditure:', data.budget_expenditure)
        console.log('Fetched Budget Income:', data.budget_income)
        console.log('Fetched Proposed Dates:', data.proposed_dates)
        console.log('=== END FETCHED DATA ===')
        
        reset({
          ...data,
          date_submission: data.date_submission || new Date().toISOString().split('T')[0]
        })
      }
    } catch (error) {
      console.error('Error fetching form:', error)
      alert('Error loading form')
    } finally {
      setInitialLoading(false)
    }
  }

  const onSubmit = async (data: FormData, isDraft = false) => {
    if (!user) {
      console.error('No user found, cannot save form')
      alert('You must be logged in to save the form')
      return
    }

    setLoading(true)
    try {
      const { data: testData, error: testError } = await supabase
        .from('forms')
        .select('count')
        .limit(1)
      
      if (testError) {
        if (testError.message?.includes('fetch')) {
          throw new Error('Cannot connect to database. Please check your Supabase configuration and internet connection.')
        } else {
          throw new Error(`Database connection failed: ${testError.message}`)
        }
      }
      
      if (!user || !user.id) {
        console.error('No user found in context')
        alert('Authentication error. Please log in again.')
        return
      }
      
      // Verify user exists in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('id', user.id)
        .limit(1)
      
      if (userError) {
        console.error('User verification failed:', userError)
        throw new Error(`User verification failed: ${userError.message}`)
      }
      
      if (!userData || userData.length === 0) {
        alert('Authentication error. Please log in again.')
        return
      }
      
      // Set user context before form submission
      try {
        await setUserContext(user.id)
      } catch (contextError) {
        // Continue anyway if context setting fails
      }
      
      // Basic validation for required fields
      if (!data.organization_name?.trim()) {
        alert('Organization name is required')
        setLoading(false)
        return
      }

      if (!data.date_submission) {
        alert('Submission date is required')
        setLoading(false)
        return
      }
      
      const formData = {
        ...data,
        user_id: user.id,
        status: isDraft ? 'draft' : 'submitted',
        submitted_at: isDraft ? null : new Date().toISOString(),
        created_at: formId ? undefined : new Date().toISOString() // Only set for new forms
      }

      let result
      if (formId) {
        result = await supabase
          .from('forms')
          .update(formData)
          .eq('id', formId)
          .select()
      } else {
        result = await supabase
          .from('forms')
          .insert([formData])
          .select()
      }

      if (result.error) {
        // Provide more specific error messages
        if (result.error.code === '42501') {
          throw new Error('Permission denied. Please check your authentication status.')
        } else if (result.error.code === '23505') {
          throw new Error('A form with this information already exists.')
        } else if (result.error.message?.includes('fetch')) {
          throw new Error('Network error. Please check your internet connection and try again.')
        } else {
          throw new Error(`Database error: ${result.error.message}`)
        }
      }

      if (!result.data || result.data.length === 0) {
        throw new Error('No data returned from database operation')
      }
      
      if (isDraft) {
        alert('Form saved as draft')
        window.location.href = backUrl
      } else {
        // For submitted forms, show PDF download option
        setSubmittedFormData(result.data[0])
        setShowPDFDownload(true)
        alert('Form submitted successfully! You can now download a PDF copy.')
      }
    } catch (error) {
      console.error('Error saving form:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Error saving form: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <a
                href={backUrl}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to {isAdmin ? 'Admin Dashboard' : 'Dashboard'}</span>
              </a>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              {formId ? (isReadOnly ? 'View' : 'Edit') : 'New'} SGLD Project Form
              {isReadOnly && <span className="ml-2 text-sm text-gray-500">(Read Only)</span>}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name of organization / SG&LD Section *
                </label>
                <input
                  type="text"
                  {...register('organization_name', { required: 'Organization name is required' })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isReadOnly}
                />
                {errors.organization_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.organization_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of submission *
                </label>
                <input
                  type="date"
                  {...register('date_submission', { required: 'Submission date is required' })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isReadOnly}
                />
                {errors.date_submission && (
                  <p className="mt-1 text-sm text-red-600">{errors.date_submission.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Proposed Dates */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Proposed Dates</h2>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => appendProposedDate({ date: '', description: '' })}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Date</span>
                </button>
              )}
            </div>

            {proposedDatesFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date {index + 1}
                  </label>
                  <input
                    type="date"
                    {...register(`proposed_dates.${index}.date`)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      {...register(`proposed_dates.${index}.description`)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="Optional description"
                      disabled={isReadOnly}
                    />
                  </div>
                  {!isReadOnly && index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeProposedDate(index)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Activity Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Activity Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization's Goal
                </label>
                <textarea
                  {...register('organization_goal')}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Concept of the Activity
                </label>
                <textarea
                  {...register('activity_concept')}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objective of the Activity
                </label>
                <textarea
                  {...register('activity_objective')}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Targeted Population
                </label>
                <textarea
                  {...register('targeted_population')}
                  rows={2}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empowerment / Developmental Opportunities
                </label>
                <textarea
                  {...register('empowerment_opportunities')}
                  rows={2}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marketing Opportunities
                </label>
                <textarea
                  {...register('marketing_opportunities')}
                  rows={2}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accreditation / Certification
                </label>
                <textarea
                  {...register('accreditation_certification')}
                  rows={2}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>

          {/* SWOT Analysis */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">SWOT Analysis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Strengths
                </label>
                <textarea
                  {...register('swot_analysis.strengths')}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weaknesses
                </label>
                <textarea
                  {...register('swot_analysis.weaknesses')}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opportunities
                </label>
                <textarea
                  {...register('swot_analysis.opportunities')}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Threats
                </label>
                <textarea
                  {...register('swot_analysis.threats')}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>

          {/* Proposed Venues */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Proposed Venues</h2>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => appendVenue({ venue: '', capacity: '', cost: '' })}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Venue</span>
                </button>
              )}
            </div>

            {venuesFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue {index + 1}
                  </label>
                  <input
                    type="text"
                    {...register(`proposed_venues.${index}.venue`)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="text"
                    {...register(`proposed_venues.${index}.capacity`)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost
                    </label>
                    <input
                      type="text"
                      {...register(`proposed_venues.${index}.cost`)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      disabled={isReadOnly}
                    />
                  </div>
                  {!isReadOnly && index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeVenue(index)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Task Team */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Task Team</h2>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => appendTaskTeam({ name: '', portfolio: '' })}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Member</span>
                </button>
              )}
            </div>

            {taskTeamFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name {index + 1}
                  </label>
                  <input
                    type="text"
                    {...register(`task_team.${index}.name`)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Portfolio
                    </label>
                    <input
                      type="text"
                      {...register(`task_team.${index}.portfolio`)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      disabled={isReadOnly}
                    />
                  </div>
                  {!isReadOnly && index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeTaskTeam(index)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Guest List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Guest List</h2>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => appendGuest({ name: '', organization: '', contact: '' })}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Guest</span>
                </button>
              )}
            </div>

            {guestListFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name {index + 1}
                  </label>
                  <input
                    type="text"
                    {...register(`guest_list.${index}.name`)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization
                  </label>
                  <input
                    type="text"
                    {...register(`guest_list.${index}.organization`)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact
                    </label>
                    <input
                      type="text"
                      {...register(`guest_list.${index}.contact`)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      disabled={isReadOnly}
                    />
                  </div>
                  {!isReadOnly && index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeGuest(index)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Proposed Programme */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Proposed Programme</h2>
            
            <textarea
              {...register('proposed_programme')}
              rows={6}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              disabled={isReadOnly}
            />
          </div>

          {/* Task Delegation */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Task Delegation</h2>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => appendTaskDelegation({
                    activity: '',
                    person_responsible: '',
                    assignment_date: '',
                    target_date: '',
                    contact_person: '',
                    telephone: ''
                  })}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Task</span>
                </button>
              )}
            </div>

            {taskDelegationFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity {index + 1}
                  </label>
                  <input
                    type="text"
                    {...register(`task_delegation.${index}.activity`)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Person Responsible
                  </label>
                  <input
                    type="text"
                    {...register(`task_delegation.${index}.person_responsible`)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignment Date
                  </label>
                  <input
                    type="date"
                    {...register(`task_delegation.${index}.assignment_date`)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    {...register(`task_delegation.${index}.target_date`)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    {...register(`task_delegation.${index}.contact_person`)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telephone
                    </label>
                    <input
                      type="text"
                      {...register(`task_delegation.${index}.telephone`)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      disabled={isReadOnly}
                    />
                  </div>
                  {!isReadOnly && index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeTaskDelegation(index)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Budget */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Budget</h2>
            
            {/* Expenditure */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-medium text-gray-900">Expenditure</h3>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => appendExpenditure({ description: '', amount: 0 })}
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                )}
              </div>
              
              {expenditureFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-3 gap-2 mb-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      {...register(`budget_expenditure.${index}.description`)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="Description"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`budget_expenditure.${index}.amount`)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="Amount"
                      disabled={isReadOnly}
                    />
                    {!isReadOnly && index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeExpenditure(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center font-medium">
                  <span>Total Expenditure:</span>
                  <span>R{totalExpenditure.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Income */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-medium text-gray-900">Income</h3>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => appendIncome({ description: '', amount: 0 })}
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                )}
              </div>
              
              {incomeFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-3 gap-2 mb-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      {...register(`budget_income.${index}.description`)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="Description"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`budget_income.${index}.amount`)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="Amount"
                      disabled={isReadOnly}
                    />
                    {!isReadOnly && index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeIncome(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center font-medium">
                  <span>Total Income:</span>
                  <span>R{totalIncome.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Net Balance:</span>
                <span className={totalIncome - totalExpenditure >= 0 ? 'text-green-600' : 'text-red-600'}>
                  R{(totalIncome - totalExpenditure).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Additional Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facilitator's / HOD Recommendation
                </label>
                <textarea
                  {...register('facilitator_recommendation')}
                  rows={4}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evaluation
                </label>
                <textarea
                  {...register('evaluation')}
                  rows={4}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>

          {/* Admin Decision Section */}
          {formId && (formData.admin_decision || formData.admin_comments) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Admin Decision</h2>
              <div className="space-y-4">
                {formData.admin_decision && (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">Decision:</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      formData.admin_decision === 'approve' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {formData.admin_decision === 'approve' ? '✅ Approved' : '❌ Rejected'}
                    </span>
                  </div>
                )}
                
                {formData.admin_comments && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Comments:</span>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-800">{formData.admin_comments}</p>
                    </div>
                  </div>
                )}
                
                {formData.admin_decision_date && (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">Decision Date:</span>
                    <span className="text-gray-600">
                      {new Date(formData.admin_decision_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                {/* Admin Signature Display */}
                {formData.admin_decision === 'approve' && formData.admin_signature_url && (
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-700 block mb-2">Admin Signature:</span>
                    <img src={formData.admin_signature_url} alt="Admin Signature" className="max-h-24 border rounded bg-white" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Actions - Hide for admins viewing existing forms */}
          {!isReadOnly && (
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleSubmit((data) => onSubmit(data, true))}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-5 w-5" />
                <span>Save as Draft</span>
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 border border-transparent text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Submit Form</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* PDF Download Section */}
          {showPDFDownload && submittedFormData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Form Submitted Successfully! 🎉
                  </h3>
                  <p className="text-green-700 mb-4">
                    Your SGLD Project Planning Form has been submitted. You can now download a PDF copy for your records.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <PDFGenerator 
                    formData={submittedFormData}
                    onComplete={() => {
                      setShowPDFDownload(false)
                      window.location.href = backUrl
                    }}
                  />
                  <button
                    onClick={() => {
                      setShowPDFDownload(false)
                      window.location.href = backUrl
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Go to {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  )
}

export default SGLDForm