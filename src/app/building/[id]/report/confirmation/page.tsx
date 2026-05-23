import { notFound } from 'next/navigation'
import { getReportByUnitID } from '@/app/actions/reports'
import { getStatusDisplay } from '@/lib/reportUtils'
import { getResourceLabel } from '@/lib/reportUtils'
import Link from 'next/link'


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
    <h2>Unit {report.unit.unitNumber}</h2>   
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
   <Link href={`/building/${id}/report?unitId=${report.unitId}`}>
  Edit report
</Link>
<Link href={`/building/${id}/report`}>
  Wrong unit? Click here
</Link>
    </div>

  )
}