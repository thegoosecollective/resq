/**
 * report/page.tsx — Resident Report Page
 *
 * Fetches building and units for the report form dropdowns.
 *
 * If a unitId query param is present, fetches the existing report
 * to pre-populate the form for editing.
 *
 * New submissions and edits both use the same page and form component.
 */

import { notFound } from "next/navigation";
import { getBuildingWithUnits } from "@/app/actions/buildings";
import BuildingReportForm from "@/app/components/BuildingReportForm";
import { getReportByUnitID } from "@/app/actions/reports";
import Link from "next/link";

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ unitId?: string }>;
}) {
  const { id } = await params;
  const { unitId } = await searchParams;

  const building = await getBuildingWithUnits(Number(id));
  if (!building) notFound();

  const existingReport = unitId
    ? await getReportByUnitID(Number(unitId))
    : null;

  return (
    <div>
      <Link
        className="underline font-bold text-lg"
        href={`/building/${building.id}`}
      >
        ← Back
      </Link>
      <BuildingReportForm
        building={building}
        units={building.units}
        existingReport={existingReport ?? undefined}
      />
    </div>
  );
}
