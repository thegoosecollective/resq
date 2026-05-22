import { notFound } from 'next/navigation'
import { getBuildingWithUnits } from '@/app/actions/buildings'
import BuildingReportForm from '@/app/components/BuildingReportForm'

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // ✅ fetching happens inside the function
  const { id } = await params
  const building = await getBuildingWithUnits(Number(id))
  if (!building) notFound()

  return (
    <div>
      <h1>{building.name}</h1>
      <BuildingReportForm building={building} units={building.units} />
    </div>
  )
}