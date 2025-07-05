import React, { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'

interface TestFormData {
  venues: Array<{ venue: string; capacity: string; cost: string }>
  team: Array<{ name: string; portfolio: string }>
  guests: Array<{ name: string; organization: string; contact: string }>
}

const FormArrayTest: React.FC = () => {
  const [submittedData, setSubmittedData] = useState<TestFormData | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm<TestFormData>({
    defaultValues: {
      venues: [{ venue: '', capacity: '', cost: '' }],
      team: [{ name: '', portfolio: '' }],
      guests: [{ name: '', organization: '', contact: '' }]
    }
  })

  const {
    fields: venuesFields,
    append: appendVenue,
    remove: removeVenue
  } = useFieldArray({ control, name: 'venues' })

  const {
    fields: teamFields,
    append: appendTeam,
    remove: removeTeam
  } = useFieldArray({ control, name: 'team' })

  const {
    fields: guestsFields,
    append: appendGuest,
    remove: removeGuest
  } = useFieldArray({ control, name: 'guests' })

  const formData = watch()

  const onSubmit = (data: TestFormData) => {
    console.log('Test form submitted:', data)
    setSubmittedData(data)
    alert('Form submitted! Check console for data.')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Form Array Test</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Venues */}
        <div className="border p-4 rounded">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Venues</h2>
            <button
              type="button"
              onClick={() => appendVenue({ venue: '', capacity: '', cost: '' })}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Add Venue
            </button>
          </div>
          
          {venuesFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-3 gap-2 mb-2">
              <input
                {...register(`venues.${index}.venue`)}
                placeholder="Venue"
                className="border p-2 rounded"
              />
              <input
                {...register(`venues.${index}.capacity`)}
                placeholder="Capacity"
                className="border p-2 rounded"
              />
              <div className="flex gap-2">
                <input
                  {...register(`venues.${index}.cost`)}
                  placeholder="Cost"
                  className="border p-2 rounded flex-1"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeVenue(index)}
                    className="bg-red-500 text-white px-2 rounded"
                  >
                    X
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Team */}
        <div className="border p-4 rounded">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Team</h2>
            <button
              type="button"
              onClick={() => appendTeam({ name: '', portfolio: '' })}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Add Member
            </button>
          </div>
          
          {teamFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-2 gap-2 mb-2">
              <input
                {...register(`team.${index}.name`)}
                placeholder="Name"
                className="border p-2 rounded"
              />
              <div className="flex gap-2">
                <input
                  {...register(`team.${index}.portfolio`)}
                  placeholder="Portfolio"
                  className="border p-2 rounded flex-1"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeTeam(index)}
                    className="bg-red-500 text-white px-2 rounded"
                  >
                    X
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Guests */}
        <div className="border p-4 rounded">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Guests</h2>
            <button
              type="button"
              onClick={() => appendGuest({ name: '', organization: '', contact: '' })}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Add Guest
            </button>
          </div>
          
          {guestsFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-3 gap-2 mb-2">
              <input
                {...register(`guests.${index}.name`)}
                placeholder="Name"
                className="border p-2 rounded"
              />
              <input
                {...register(`guests.${index}.organization`)}
                placeholder="Organization"
                className="border p-2 rounded"
              />
              <div className="flex gap-2">
                <input
                  {...register(`guests.${index}.contact`)}
                  placeholder="Contact"
                  className="border p-2 rounded flex-1"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeGuest(index)}
                    className="bg-red-500 text-white px-2 rounded"
                  >
                    X
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white px-6 py-2 rounded"
        >
          Submit Test Form
        </button>
      </form>

      {/* Debug Info */}
      <div className="mt-6 border p-4 rounded">
        <h3 className="font-semibold mb-2">Current Form Data:</h3>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>

      {/* Submitted Data */}
      {submittedData && (
        <div className="mt-6 border p-4 rounded">
          <h3 className="font-semibold mb-2">Submitted Data:</h3>
          <pre className="text-xs bg-green-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default FormArrayTest 