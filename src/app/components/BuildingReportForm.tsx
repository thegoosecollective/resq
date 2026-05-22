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
  }: {
    building: Building
    units: Unit[]
  }) {
    
    const router = useRouter()

    //getting floors from actual unit data instead of totalFloors for accuracy
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null)
    const [residentStatus, setResidentStatus] = useState<ResidentStatus | null>(null)
    const [resourceRequests, setResourceRequests] = useState<string[]>([])
    const [notes, setNotes] = useState('')      
    const [isSubmitting, setIsSubmitting] = useState(false)      
    const [error, setError] = useState<string | null>(null)
    const [totalOccupants, setTotalOccupants] = useState<number | null>(null)
    const [occupantsEvacuated, setOccupantsEvacuated] = useState<number>(0)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    const floors = [...new Set(units.map(u => u.floor))].sort((a, b) => a - b)
    const floorUnits = selectedFloor ? units.filter(u => u.floor === selectedFloor) : []

    function handleTotalOccupantsChange(value: number) {
      setTotalOccupants(value)
      setOccupantsEvacuated(0)
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

      async function handleSubmit() {
        const errors: Record<string, string> = {}
      
        if (!selectedFloor) errors.floor = 'Please select a floor'
        if (!selectedUnitId) errors.unit = 'Please select a unit'
        if (!totalOccupants) errors.totalOccupants = 'Please select total occupants'
        if (!residentStatus) errors.status = 'Please select a status'
        if (
          (residentStatus === 'assistance' || residentStatus === 'emergency') && 
          resourceRequests.length === 0
        ) errors.resources = 'Please select at least one resource'
      
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors)
          return
        }

setFieldErrors({})
        setIsSubmitting(true)
        setError(null) 
      
        const result = await submitReport({
          unitId: selectedUnitId!, 
          residentStatus: residentStatus!,
          totalOccupants: totalOccupants ?? 0,
          occupantsEvacuated,
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

      return (
        <div className="space-y-6">
      
          {/* error */}
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
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


 {/* Evacuated dropdown, only show when someone still needs help */}


 {totalOccupants && (
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
      <option value="">How many have already made it out?</option>
      <option value={0}>0 — nobody out yet</option>
      {occupantOptions.filter(n => n <= (totalOccupants ?? 15)).map(occupant => (
        <option key={occupant} value={occupant}>{occupant}</option>
      ))}
    </select>
  </div>

)}


        {/* status buttons */}    
 
            <div className={`statusButtonContainer ${fieldErrors.status ? 'border border-red-500 rounded-lg p-2' : ''}`}>
            {fieldErrors.status && (
  <p className="text-red-500 text-sm mt-1">{fieldErrors.status}</p>
)}
               <p>What is the situation for those still inside?</p>

            

               {statusOptions.filter(option => {
  if (
    option.value === 'evacuated' && 
    // only filter after total is selected
    totalOccupants !== null &&  
    occupantsEvacuated !== totalOccupants
  ) return false
  return true
}).map(option =>  (
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
               {requestOptions.map(option =>  (
                <label key={option.value} className="flex items-center gap-2">
               
                <input
                  type="checkbox"
                  value={option.value}
                  checked={resourceRequests.includes(option.value)}
                  onChange={() => toggleResource(option.value)}
                  disabled={residentStatus !== 'assistance' && residentStatus !== 'emergency'}
                />
                {option.label}
              </label>
              ))}
              </div>
    
    

     {/* Notes */}  
     
    
      <div>
        <p>Please include any relevant notes:</p>
<textarea 
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