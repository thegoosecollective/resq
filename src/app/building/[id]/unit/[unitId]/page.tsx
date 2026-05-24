/**
 * unit/[unitId]/page.tsx — Unit Detail Page
 *
 * Role-aware unit detail view — family members see status and occupant info,
 * first responders see full details including notes and status update controls.
 *
 * Responders can access units with no resident report to mark attendance.
 *
 * Role is determined by the ?responder=true query parameter.
 */

import { notFound } from "next/navigation";
import { getReportByUnitID } from "@/app/actions/reports";
import UnitDetailView from "@/app/components/UnitDetailView";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function UnitReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; unitId: string }>;
  searchParams: Promise<{ responder?: string }>;
}) {
  const { id, unitId } = await params;
  const { responder } = await searchParams;
  const isResponder = responder === "true";

  const report = await getReportByUnitID(Number(unitId));

  if (!report && !isResponder) notFound();

  const backHref = isResponder
    ? `/building/${id}/dashboard?responder=true`
    : `/building/${id}/dashboard`;

  return (
    <div>
      <Link href={backHref} className="underline font-bold text-lg">
        ← Back to dashboard
      </Link>
      <UnitDetailView
        report={report}
        isResponder={isResponder}
        unitId={Number(unitId)}
      />
    </div>
  );
}
