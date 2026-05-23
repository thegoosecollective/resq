import DashboardView from '@/app/components/DashboardView'
import { getBuildingReports } from '@/app/actions/buildings'
import { notFound } from 'next/navigation'

export default async function DashboardPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const building = await getBuildingReports(Number(id))
  if (!building) notFound()

  return (
    <div>
      <DashboardView
  building={building}
  units={building.units}  
/>
    </div>
  )
}