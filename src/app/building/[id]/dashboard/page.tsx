import DashboardView from '@/app/components/DashboardView'
import { getBuildingReports } from '@/app/actions/buildings'
import { notFound } from 'next/navigation'
export const dynamic = 'force-dynamic'

export default async function DashboardPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ responder?: string }>
}) {
  const { id } = await params
  const { responder } = await searchParams
  const isResponder = responder === 'true'
  const building = await getBuildingReports(Number(id))
  if (!building) notFound()

  return (
    <div>
      <DashboardView
  building={building}
  units={building.units}
  isResponder={isResponder}  
/>
    </div>
  )
}