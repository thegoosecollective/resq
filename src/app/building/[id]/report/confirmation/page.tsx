import { notFound } from 'next/navigation'
import { getReportByUnitID } from '@/app/actions/reports'
import { getStatusDisplay } from '@/lib/reportUtils'
import { getResourceLabel } from '@/lib/reportUtils'


export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ unitId?: string }>
}) {
  const { id } = await params
  const { unitId } = await searchParams

  if (!unitId) notFound()

  const report = await getReportByUnitID(Number(unitId))

  if (!report) notFound()

  const { colour, label } = getStatusDisplay(
    report.residentStatus,
    report.resourceRequests
  )

  return (
    <div>
    <p>Your report has been updated</p>
    <h2>Unit {report.unit.unitNumber} — Floor {report.unit.floor}</h2>   
    <button style={{ backgroundColor: colour, color: 'white' }} disabled>{label}</button>
    <p>Last updated: {new Date(report.submittedAt).toLocaleString()}</p>

   <p>Resource requests:</p>
   <ul>
   {report.resourceRequests.map(r => (
  <li key={r}>{getResourceLabel(r)}</li>
))}

   </ul>

   <p>Notes:</p>

   <div>
    {report.notes}
   </div>
   <button type="button">Edit report</button>
   <button type="button">Wrong unit? Click here</button>
    </div>

  )
}