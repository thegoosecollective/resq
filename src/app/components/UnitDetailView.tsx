'use client'
import { useState } from 'react'
import { ResponderStatus } from '@prisma/client'
import { getResourceLabel } from '@/lib/reportUtils'

type Report = {
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
    const [responderStatus, setResponderStatus] = useState<ResponderStatus | null>(
        report.responderStatus as ResponderStatus | null
      )
      return(
        <div>
            <h2>Unit {report.unit.unitNumber}</h2>   

    <p>Submitted at : {new Date(report.submittedAt).toLocaleString()}</p>
    <p>Last updated: {new Date(report.updatedAt).toLocaleString()}</p>

    <p>{report.residentStatus}</p>
<p>Evacuated: {report.occupantsEvacuated}/{report.totalOccupants} occupants</p>

   <p>Resource requests:</p>
   <ul>
   {report.resourceRequests.map(r => (
  <li key={r}>{getResourceLabel(r)}</li>
))}

   </ul>

   {report.notes &&  isResponder &&(
  <>
    <p>Notes:</p>
    <div>{report.notes}</div>
    <div>
    <p>Responder status:</p>

  </div>
  </>
)}
        </div>
      )
}