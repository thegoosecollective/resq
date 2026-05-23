import { notFound } from 'next/navigation'
import { getBuildingWithUnits } from '@/app/actions/buildings'
import BuildingReportForm from '@/app/components/BuildingReportForm'
import { getReportByUnitID } from '@/app/actions/reports'

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ unitId?: string }>
}) {
  const { id } = await params
  const { unitId } = await searchParams

  const building = await getBuildingWithUnits(Number(id))
  if (!building) notFound()

  const existingReport = unitId
    ? await getReportByUnitID(Number(unitId))
    : null

  return (
    <div>
      <h1>{building.name}</h1>
      <BuildingReportForm
        building={building}
        units={building.units}
        existingReport={existingReport ?? undefined}
      />
    </div>
  )
}