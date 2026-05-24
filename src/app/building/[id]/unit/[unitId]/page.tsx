import { getResponderStatusDisplay } from '@/lib/reportUtils'
import { notFound } from 'next/navigation'
import { getReportByUnitID } from '@/app/actions/reports'
import UnitDetailView from '@/app/components/UnitDetailView'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function UnitReportPage({
  params,
  searchParams
}: {
    params: Promise<{ id: string; unitId: string }>
    searchParams: Promise<{ responder?: string }>
}) {
 const { id, unitId } = await params
  const { responder } = await searchParams
  const isResponder = responder === 'true'
  const report = await getReportByUnitID(Number(unitId))
  const backHref = isResponder
  ? `/building/${id}/dashboard?responder=true`
  : `/building/${id}/dashboard`

  if (!report && !isResponder) notFound()  

 return (
  <div>
    <Link href={backHref} className="text-sm font-bold text-blue-600 underline underline-offset-2">
      ← Back to dashboard
    </Link>
    <UnitDetailView
      report={report}
      isResponder={isResponder}
      unitId={Number(unitId)}
    />
  </div>
)
}