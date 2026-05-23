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
      <h1>{building.name}</h1>
      <DashboardView
  building={building}
  units={building.units}  
/>
    </div>
  )
}