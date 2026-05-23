import { notFound } from 'next/navigation'
import { getReportByUnitID } from '@/app/actions/reports'

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

  return (
   
  )
}