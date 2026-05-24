'use client'
import { useState } from 'react'
import { ResponderStatus } from '@prisma/client'
import { getResourceLabel, getResponderStatusDisplay } from '@/lib/reportUtils'
import { updateResponderStatus } from '@/app/actions/reports'
import { useRouter } from 'next/navigation'


const statusOptions = [
  { value: 'evacuated',  label: 'All evacuated',  style: 'bg-green-50 border-green-300 text-green-800' },
  { value: 'in_progress', label: 'In progress',       style: 'bg-yellow-50 border-yellow-300 text-yellow-800' },
  { value: 'deceased',  label: 'Deceased occupant', style: 'bg-red-50 border-red-300 text-red-800' },
]


type Report = {
  unitId: number 
    residentStatus: string
    responderStatus: string | null
    resourceRequests: string[]
    totalOccupants: number
    occupantsEvacuated: number
    notes: string | null
    submittedAt: Date
    updatedAt: Date
    unit: {
      floor: number
      unitNumber: string
    }
  }

export default function UnitDetailView({
    report, 
    isResponder
  }: {
    report: Report
    isResponder: boolean
  }) {
    const router = useRouter()

    const [responderStatus, setResponderStatus] = useState<ResponderStatus | null>(
        report.responderStatus as ResponderStatus | null
      )

      async function handleResponderStatusChange(status: ResponderStatus) {
        setResponderStatus(status)
        
        const result = await updateResponderStatus({
          unitId: report.unitId,
          responderStatus: status,
        })
      
        if (result.success) {
          router.refresh() 
        } else {
          setResponderStatus(report.responderStatus as ResponderStatus | null)
          alert('Failed to update status. Please try again.')
        }
      }

      return(
        <div>
            <h2>Unit {report.unit.unitNumber}</h2>   

    <p>Submitted at : {new Date(report.submittedAt).toISOString().replace('T', ' ').slice(0, 16)}</p>
    <p>Last updated: {new Date(report.updatedAt).toISOString().replace('T', ' ').slice(0, 16)}
</p>

    <p>{report.residentStatus}</p>
    {!isResponder && report.responderStatus && (
  <p>Responder update: {getResponderStatusDisplay(report.responderStatus, false)}</p>
)}
<p>Evacuated: {report.occupantsEvacuated}/{report.totalOccupants} occupants</p>

   <p>Resource requests:</p>
   <ul>
   {report.resourceRequests.map(r => (
  <li key={r}>{getResourceLabel(r)}</li>
))}

   </ul>

{/* for first responders only */}
{report.notes && isResponder && (
  <div>
    <p>Notes:</p>
    <div>{report.notes}</div>
  </div>
)}

{isResponder && (
  <div>
    <p>Current responder status: {responderStatus 
      ? getResponderStatusDisplay(responderStatus, true)
      : 'Not yet attended'
    }</p>
    
    <p>Update status:</p>
    {statusOptions.map(option => (
      <button
        key={option.value}
        onClick={() => handleResponderStatusChange(option.value as ResponderStatus)}
        className={responderStatus === option.value ? 'ring-2 ring-offset-1 ring-current' : 'opacity-70'}
      >
        {option.label}
      </button>
    ))}
  </div>
)}
  </div> 
      )}