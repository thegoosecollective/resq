import DashboardView from "@/app/components/DashboardView";
import { getBuildingReports } from "@/app/actions/buildings";
import { notFound } from "next/navigation";
import Link from "next/link";

// Ensures fresh data on every load
// Dashboard must reflect real-time submissions
export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ responder?: string }>;
}) {
  const { id } = await params;
  const { responder } = await searchParams;
  const isResponder = responder === "true";
  const building = await getBuildingReports(Number(id));
  if (!building) notFound();

  return (
    <div>
      <Link href={`/building/${id}`} className="underline font-bold text-lg">
        ← Back
      </Link>
      <DashboardView
        building={building}
        units={building.units}
        isResponder={isResponder}
      />
    </div>
  );
}
