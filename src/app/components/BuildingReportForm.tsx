'use client'

import { useState } from 'react'
import { submitReport } from '@/app/actions/reports'
import { ResidentStatus } from '@prisma/client'

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
  


  export default function BuildingReportForm({
    building,
    units,
  }: {
    building: Building
    units: Unit[]
  }) {
    
    //getting floors from actual unit data instead of totalFloors for accuracy
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null)
    const [residentStatus, setResidentStatus] = useState<ResidentStatus | null>(null)
    const [resourceRequests, setResourceRequests] = useState<string[]>([])
    const [notes, setNotes] = useState('')      
    const [isSubmitted, setIsSubmitted] = useState(false)  
    const [isSubmitting, setIsSubmitting] = useState(false)      
    const [error, setError] = useState('')         

    const floors = [...new Set(units.map(u => u.floor))].sort((a, b) => a - b)
    const floorUnits = selectedFloor ? units.filter(u => u.floor === selectedFloor) : []
    
    function handleFloorChange(floor: number) {
        setSelectedFloor(floor)
        setSelectedUnitId(null) 
      }
      
      function handleStatusChange(status: ResidentStatus) {
        setResidentStatus(status)
      }
      
     function handleUnitIDChange(unit: number) {
        setSelectedUnitId(unit)
      }

      function toggleResource(value: string) {
        setResourceRequests(prev =>
          prev.includes(value)
            ? prev.filter(r => r !== value)
            : [...prev, value]
        )
      }

      async function handleSubmit() {
        // checks if mandatory fields are complete
        if (!selectedFloor || !selectedUnitId || !residentStatus) {
          setError('Please select your floor, unit and status before submitting.')
          return
        }
      
        setIsSubmitting(true)
        setError(null) 
      
        const result = await submitReport({
          unitId: selectedUnitId,
          residentStatus,
          resourceRequests,
          notes: notes.trim() || undefined,
        })
      
        if (result.success) {
          setIsSubmitted(true)
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
          <div className="floorDropdown">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor
            </label>
            <select
              value={selectedFloor ?? ''}
              onChange={e => handleFloorChange(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-3 bg-white"
            >
              <option value="">Select your floor</option>
              {floors.map(floor => (
                <option key={floor} value={floor}>Floor {floor}</option>
              ))}
            </select>
          </div>
      
        {/*Unit dropdown*/}
        {selectedFloor && (
                <div className="unitDropdown">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <select
                  value={selectedUnitId ?? ''}
                  onChange={e => handleUnitIDChange(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white"
                >
                  <option value="">Select your unit</option>
                  {floorUnits.map(unit =>  (
                    <option key={unit.id} value={unit.id}>Unit {unit.unitNumber}</option>
                  ))}
                </select>
              </div>
          )}
    
        </div>
      )
};