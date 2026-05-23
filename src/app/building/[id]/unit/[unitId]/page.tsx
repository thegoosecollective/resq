import { getResponderStatusDisplay } from '@/lib/reportUtils'
import { notFound } from 'next/navigation'
import { getReportByUnitID } from '@/app/actions/reports'
import UnitDetailView from '@/app/components/UnitDetailView'

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
  if (!report) notFound()

  return (
    <div>
      <UnitDetailView
      report={report}
      isResponder={isResponder}
    />
    </div>
  )
}