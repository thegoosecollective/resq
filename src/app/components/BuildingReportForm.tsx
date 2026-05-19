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
    const floors = [...new Set(units.map(u => u.floor))].sort((a, b) => a - b)
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
 
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null)
    const [residentStatus, setResidentStatus] = useState<ResidentStatus | null>(null)
    const [resourceRequests, setResourceRequests] = useState<string[]>([])
    const [notes, setNotes] = useState('')      
    const [isSubmitted, setIsSubmitted] = useState(false)  
    const [isSubmitting, setIsSubmitting] = useState(false)      
    const [error, setError] = useState('')         


    
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

    return(

    )
};