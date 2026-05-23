'use client'

import { useState } from 'react'
import { submitReport } from '@/app/actions/reports'
import { ResidentStatus } from '@prisma/client'
import { useRouter } from 'next/navigation'

type Unit = {
    id: number
    floor: number
    unitNumber: string
}
  
type Building = {
    id: number
    name: string
    address: string
}
  
const statusOptions = [
    { value: 'evacuated',  label: 'Everyone in my unit is out safely',  style: 'bg-green-50 border-green-300 text-green-800' },
    { value: 'assistance', label: 'Some or all of us still need help getting out',       style: 'bg-yellow-50 border-yellow-300 text-yellow-800' },
    { value: 'emergency',  label: 'Someone is in immediate life-threatening danger', style: 'bg-red-50 border-red-300 text-red-800' },
  ]

  const requestOptions = [
    { value: 'mobility',  label: 'Mobility assistance' },
    { value: 'pet', label: 'Pet evacuation'      },
    { value: 'medical',  label: 'Medical assistance' },
  ]

  const occupantOptions = Array.from({ length: 15 }, (_, i) => i + 1)


  export default function BuildingReportForm({
    building,
    units,
    existingReport,
  }: {
    building: Building
    units: Unit[]
    existingReport?: {
      residentStatus: ResidentStatus
      resourceRequests: string[]
      totalOccupants: number
      occupantsEvacuated: number
      notes: string | null
      unitId: number
      updatedAt: Date 
      unit: {
        floor: number
        unitNumber: string
      }
    }
  }) {
    
    const router = useRouter()

    //getting floors from actual unit data instead of totalFloors for accuracy
    const [selectedFloor, setSelectedFloor] = useState<number | null>(
      existingReport?.unit.floor ?? null
    )
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(
      existingReport?.unitId ?? null
    )
    const [residentStatus, setResidentStatus] = useState<ResidentStatus | null>(
      existingReport?.residentStatus ?? null
    )
    
    
    const [resourceRequests, setResourceRequests] = useState<string[]>(
      existingReport?.resourceRequests ?? []
    )
    
    const [notes, setNotes] = useState<string>(
      existingReport?.notes ?? ''  
    )
    const [isSubmitting, setIsSubmitting] = useState(false)      
    const [error, setError] = useState<string | null>(null)
    const [totalOccupants, setTotalOccupants] = useState<number | null>(      existingReport?.totalOccupants ?? null)
    const [occupantsEvacuated, setOccupantsEvacuated] = useState<number | null>(existingReport?.occupantsEvacuated ?? null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [staleWarning, setStaleWarning] = useState<Date | null>(null)

    const floors = [...new Set(units.map(u => u.floor))].sort((a, b) => a - b)
    const floorUnits = selectedFloor ? units.filter(u => u.floor === selectedFloor) : []
    const availableResources = totalOccupants !== null && occupantsEvacuated === totalOccupants
      ? requestOptions.filter(r => r.value === 'pet')
      : requestOptions

      function handleTotalOccupantsChange(value: number) {
        setTotalOccupants(value)
        setOccupantsEvacuated(null)  // ← was 0
        setResidentStatus(null)
        setFieldErrors(prev => ({ ...prev, totalOccupants: '' }))
      }

    function handleOccupantsEvacuatedChange(value: number) {
      if (!totalOccupants) return
      
      if (value > totalOccupants) {
        setError('Evacuated occupants cannot exceed total occupants.')
        return
      }
      
      // if counts no longer match, evacuated status is no longer valid
      if (residentStatus === 'evacuated' && value !== totalOccupants) {
        setResidentStatus(null)
      }
      
      setError(null)
      setOccupantsEvacuated(value)
    }

    function handleFloorChange(floor: number) {
      setSelectedFloor(floor)
      setSelectedUnitId(null)
      setFieldErrors(prev => ({ ...prev, floor: '' }))  
    }
      
      function handleStatusChange(status: ResidentStatus) {
        setResidentStatus(status)
        setFieldErrors(prev => ({ ...prev, status: '' }))
          // clear resource requests if switching to evacuated
        if (status === 'evacuated') {
           setResourceRequests([])
         }
      }
      
      function handleUnitIDChange(unit: number) {
        setSelectedUnitId(unit)
        setFieldErrors(prev => ({ ...prev, unit: '' }))
      }

      function toggleResource(value: string) {
        setResourceRequests(prev =>
          prev.includes(value)
            ? prev.filter(r => r !== value)
            : [...prev, value]
        )
        setFieldErrors(prev => ({ ...prev, resources: '' }))
      }

      async function performSubmit() {
        setFieldErrors({})
        setIsSubmitting(true)
        setError(null)
      
        const result = await submitReport({
          unitId: selectedUnitId!,
          residentStatus: residentStatus!,
          totalOccupants: totalOccupants ?? 0,
          occupantsEvacuated: occupantsEvacuated ?? 0,
          resourceRequests,
          notes: notes.trim() || undefined,
        })
      
        if (result.success) {
          router.push(`/building/${building.id}/report/confirmation?unitId=${selectedUnitId}`)
        } else {
          setError(result.error || 'Something went wrong. Please try again.')
        }
      
        setIsSubmitting(false)
      }
      
      async function handleConfirmedSubmit() {
        setStaleWarning(null)
        await performSubmit()
      }
      
      async function handleSubmit() {
        const errors: Record<string, string> = {}
      
        if (!selectedFloor) errors.floor = 'Please select a floor'
        if (!selectedUnitId) errors.unit = 'Please select a unit'
        if (!totalOccupants) errors.totalOccupants = 'Please select total occupants'
        if (occupantsEvacuated === null) errors.evacuated = 'Please select how many have evacuated'
        if (!residentStatus) errors.status = 'Please select a status'
        if (
          (residentStatus === 'assistance' || residentStatus === 'emergency') &&
          resourceRequests.length === 0
        ) errors.resources = 'Please select at least one resource'
      
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors)
          return
        }
      
        // warn if overwriting a different unit's report
        if (existingReport && selectedUnitId !== existingReport.unitId) {
          setStaleWarning(new Date(existingReport.updatedAt))
          return
        }
      
        await performSubmit()
      }
      return (
        <div className="space-y-6">
      
          {/* error */}
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
      
      {staleWarning && (
  <div className="border border-yellow-400 bg-yellow-50 rounded-lg p-4">

<p className="font-medium text-yellow-800">⚠️ You're changing units</p>
<p className="text-sm text-yellow-700">
  You're submitting for a different unit than your original report. Your original report for Unit {existingReport?.unit.unitNumber} will remain in the system.
</p>
<p className="text-sm text-yellow-700">Continue?</p>
  </div>
)}

          {/* floor dropdown */}

          <div className={`floorDropdownContainer ${fieldErrors.floor ? 'border border-red-500 rounded-lg p-2' : ''}`}>
          {fieldErrors.floor && (
  <p className="text-red-500 text-sm mt-1">{fieldErrors.floor}</p>
)}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor
            </label>
            <select
              value={selectedFloor ?? ''}
              onChange={e => handleFloorChange(Number(e.target.value))}
              className={`border ${fieldErrors.floor ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Select your floor</option>
              {floors.map(floor => (
                <option key={floor} value={floor}>Floor {floor}</option>
              ))}
            </select>
          </div>
      
        {/* unit dropdown */}

        <div className={fieldErrors.unit ? 'border-2 border-red-500 rounded-lg p-2' : 'border border-gray-300 rounded-lg p-2'}>
        {fieldErrors.unit && (
  <p className="text-red-500 text-sm mt-1">{fieldErrors.unit}</p>
)}
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <select
                 disabled={!selectedFloor}
                  value={selectedUnitId ?? ''}
                  onChange={e => handleUnitIDChange(Number(e.target.value))}
                   >
                  <option value="">Select your unit</option>
                  {floorUnits.map(unit =>  (
                    <option key={unit.id} value={unit.id}>Unit {unit.unitNumber}</option>
                  ))}
                </select>
              </div>
          
        {/* Occupant selection */}

        <div className={`occupantSelectionContainer ${fieldErrors.totalOccupants ? 'border border-red-500 rounded-lg p-2' : ''}`}>
        {fieldErrors.totalOccupants && (
  <p className="text-red-500 text-sm mt-1">{fieldErrors.totalOccupants}</p>
)}
          <p>How many people are/were in your unit?</p>
          <select
          disabled={!selectedUnitId}
          onChange={e => handleTotalOccupantsChange(Number(e.target.value))}          value={totalOccupants ?? ''}
          >
            <option value="">Total occupants</option>
              {occupantOptions.map(occupant => (
                <option key={occupant} value={occupant}>{occupant}</option>
              ))}
          </select>
          </div>


 {/* Evacuated dropdown */}

    <div className={`evacuateSelectionContainer ${fieldErrors.evacuated ? 'border border-red-500 rounded-lg p-2' : ''}`}>
    
  {fieldErrors.evacuated && (
  <p className="text-red-500 text-sm mt-1">{fieldErrors.evacuated}</p>
)}
    <p>How many have already made it out?</p>
    <select
      disabled={!totalOccupants}
      onChange={e => handleOccupantsEvacuatedChange(Number(e.target.value))}
      value={occupantsEvacuated ?? ''}
      >
<option value="">Select</option>

      <option value={0}>0 — nobody out yet</option>
      {occupantOptions.filter(n => n <= (totalOccupants ?? 15)).map(occupant => (
        <option key={occupant} value={occupant}>{occupant}</option>
      ))}
    </select>
  </div>




        {/* status buttons */}    
 
            <div className={`statusButtonContainer ${fieldErrors.status ? 'border border-red-500 rounded-lg p-2' : ''}`}>
            {fieldErrors.status && (
  <p className="text-red-500 text-sm mt-1">{fieldErrors.status}</p>
)}
<p className="text-sm text-gray-500">
  {totalOccupants !== null && occupantsEvacuated === totalOccupants
    ? 'All occupants accounted for. Use resource requests for pet evacuation.'
    : 'Status refers to people only. Use resource requests for pet evacuation.'
  }
</p>
            

{statusOptions.filter(option => {
  // hide evacuated if not everyone is out
  if (
    option.value === 'evacuated' &&
    totalOccupants !== null &&
    occupantsEvacuated !== totalOccupants
  ) return false

  // hide assistance/emergency if everyone is out
  if (
    (option.value === 'assistance' || option.value === 'emergency') &&
    totalOccupants !== null &&
    occupantsEvacuated === totalOccupants
  ) return false

  return true
}).map(option => (
                    <button
                    disabled={!selectedUnitId}
                    className={`${residentStatus === option.value ? 'ring-2 ring-offset-1 ring-current' : 'opacity-70'}`}
                    key={option.value}
                    onClick={() => handleStatusChange(option.value as ResidentStatus)}>
                    {option.label}
                  </button>
                  ))}
                  <p>
Please select honestly as accurate status helps responders reach those who need help most
</p>
              </div>
          

  {/* Resource request */}    

        
               <div className={`resourceRequestsContainer ${fieldErrors.resources ? 'border border-red-500 rounded-lg p-2' : ''}`}>
              
               {fieldErrors.resources && (
  <p className="text-red-500 text-sm mt-1">{fieldErrors.resources}</p>
)}
               <p>Resource requests</p>
               {availableResources.map(option =>  (
                <label key={option.value} className="flex items-center gap-2">
               
                <input
                  type="checkbox"
                  value={option.value}
                  checked={resourceRequests.includes(option.value)}
                  onChange={() => toggleResource(option.value)}
                  disabled={
                    residentStatus !== 'assistance' && 
                    residentStatus !== 'emergency' && 
                    !(residentStatus === 'evacuated' && occupantsEvacuated === totalOccupants)
                  }
                />
                {option.label}
              </label>
              ))}
              </div>
    
    

     {/* Notes */}  
     
    
      <div>
        <p>Please include any relevant notes:</p>
<textarea 
  value={notes}
disabled={!residentStatus}
className="w-full border border-gray-300 rounded-lg p-3 h-28 resize-none"
onChange={e => setNotes(e.target.value)}
  ></textarea>
      </div>
     

     <div>
     <button
  type="button"  
  onClick={handleSubmit}
>
  {isSubmitting ? 'Submitting...' : 'Submit Report'}
</button>

     </div>
     </div>
      )
};