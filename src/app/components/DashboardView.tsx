/**
 * components/DashboardView.tsx — Building Dashboard Grid
 *
 * Client component displaying a colour-coded grid of all units in a building.
 * Role-aware — responders see operational overlays (in progress, deceased) and
 * status/floor filters. Family members see resident status only with floor filter.
 *
 * All filtering is client-side — no additional DB calls after initial page load.
 */

"use client";
import { useState } from "react";
import { getStatusDisplay } from "@/lib/reportUtils";
import Link from "next/link";
import Select from "@/app/components/ui/Select";

type Report = {
  residentStatus: string | null;
  responderStatus: string | null;
  resourceRequests: string[];
  totalOccupants: number;
  occupantsEvacuated: number;
};

type Unit = {
  id: number;
  floor: number;
  unitNumber: string;
  report: Report | null;
};

type Building = {
  id: number;
  name: string;
  address: string;
};

const statusFilterOptions = [
  { value: "emergency", label: "🔴 Critical" },
  { value: "assistance", label: "🟡 Assistance" },
  { value: "evacuated", label: "🟢 Evacuated" },
  { value: "pet_rescue", label: "🔵 Pet rescue" },
  { value: "in_progress", label: "🟠 In progress" },
  { value: "none", label: "⚪ No report" },
  { value: "deceased", label: "⚫ Deceased" },
];

export default function DashboardView({
  building,
  units,
  isResponder,
}: {
  building: Building;
  units: Unit[];
  isResponder: boolean;
}) {
  // Client-side filtering — all units loaded once on page load
  // Floor/status filtering happens in memory with no additional DB calls
  // Suitable for buildings under 500 units
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const reportedCount = units.filter((u) => u.report !== null).length;
  const totalCount = units.length;
  const emergencyCount = units.filter(
    (u) => u.report?.residentStatus === "emergency" &&
    u.report?.responderStatus !== "evacuated"
  ).length;
  const assistanceCount = units.filter(
    (u) => u.report?.residentStatus === "assistance"
  ).length;

  const floors = [...new Set(units.map((u) => u.floor))].sort((a, b) => a - b);
  const visibleUnits = units
    .filter((u) => (selectedFloor ? u.floor === selectedFloor : true))
    .filter((u) => {
      if (!statusFilter) return true;
      if (statusFilter === "none") return u.report === null;
      if (statusFilter === "pet_rescue")
        return (
          u.report?.residentStatus === "evacuated" &&
          u.report?.resourceRequests.includes("pet")
        );
      return (
        u.report?.residentStatus === statusFilter ||
        u.report?.responderStatus === statusFilter
      );
    });

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            {isResponder ? "Responder Dashboard" : "Family Dashboard"}
          </p>
          <h1 className="text-2xl font-bold text-slate-900">{building.name}</h1>
          <p className="text-sm font-medium text-slate-500">
            {building.address}
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-2">
            <span className="text-lg font-bold text-slate-900">
              {reportedCount}/{totalCount}
            </span>
            <span className="text-sm font-medium text-slate-500">
              units reporting
            </span>
          </div>

          {isResponder && (
            <>
              <div
                className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2"
                role="status"
                aria-label={`${emergencyCount} critical units`}
              >
                <span className="text-lg font-bold text-red-700">
                  {emergencyCount}
                </span>
                <span className="text-sm font-medium text-red-600">
                  critical
                </span>
              </div>
              <div
                className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-2"
                role="status"
                aria-label={`${assistanceCount} units need assistance`}
              >
                <span className="text-lg font-bold text-amber-700">
                  {assistanceCount}
                </span>
                <span className="text-sm font-medium text-amber-600">
                  need assistance
                </span>
              </div>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Filter by floor
            </label>
            <Select
              value={selectedFloor ?? ""}
              onChange={(e) =>
                setSelectedFloor(e.target.value ? Number(e.target.value) : null)
              }
              placeholder="All floors"
              options={floors.map((f) => ({ value: f, label: `Floor ${f}` }))}
            />
          </div>

          {isResponder && (
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Filter by status
              </label>
              <Select
                value={statusFilter ?? ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                placeholder="All statuses"
                options={statusFilterOptions}
              />
            </div>
          )}
        </div>

        {/* Legend */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Colour legend
          </p>
          <div
            className="flex flex-wrap gap-2 pointer-events-none select-none"
            role="list"
          >
            {[
              { colour: "#16A34A", label: "Evacuated", textColour: "#fff" },
              {
                colour: "#F59E0B",
                label: "Needs assistance",
                textColour: "#1C1917",
              },
              { colour: "#DC2626", label: "Critical", textColour: "#fff" },
              { colour: '#EA580C', label: isResponder ? 'In progress' : 'Help is on the way', textColour: '#fff' },
              { colour: "#2563EB", label: "Pet rescue", textColour: "#fff" },
              ...(isResponder
                ? [
                    {
                      colour: "#374151",
                      label: "Deceased",
                      textColour: "#fff",
                    },
                  ]
                : []),
              { colour: "#CBD5E1", label: "No report", textColour: "#1E293B" },
            ].map((item) => (
              <div
                key={item.label}
                role="listitem"
                className="px-2 py-1 rounded-md text-xs font-bold"
                style={{ backgroundColor: item.colour, color: item.textColour }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Unit grid */}
        <section aria-label="Unit status grid">
          {visibleUnits.length === 0 ? (
            <p className="text-sm font-medium text-slate-500 text-center py-10">
              No units match the current filter.
            </p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {visibleUnits.map((unit) => {
                const { colour, label, textColour } = getStatusDisplay(
                  unit.report?.residentStatus ?? null,
                  unit.report?.resourceRequests ?? [],
                  unit.report?.responderStatus ?? null,
                  isResponder
                );

                const cardContent = (
                  <>
                    <p className="font-bold text-sm leading-tight">
                      {unit.unitNumber}
                    </p>
                    {unit.report && unit.report.totalOccupants > 0 && (
                      <p className="text-xs font-medium opacity-90 mt-0.5">
                        {unit.report.occupantsEvacuated}/
                        {unit.report.totalOccupants}
                      </p>
                    )}
                    {!unit.report && (
                      <p className="text-xs font-medium opacity-75 mt-0.5">—</p>
                    )}
                  </>
                );

                const cardStyle = {
                  backgroundColor: colour,
                  color: textColour,
                };

                const cardClass =
                  "aspect-square rounded-lg p-2 flex flex-col justify-center items-center text-center transition-transform";

                return unit.report || isResponder ? (
                  <Link
                    key={unit.id}
                    href={
                      isResponder
                        ? `/building/${building.id}/unit/${unit.id}?responder=true`
                        : `/building/${building.id}/unit/${unit.id}`
                    }
                    style={cardStyle}
                    className={`${cardClass} hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900`}
                    aria-label={`Unit ${unit.unitNumber}: ${label}${
                      unit.report && unit.report.totalOccupants > 0
                        ? `, ${unit.report.occupantsEvacuated} of ${unit.report.totalOccupants} evacuated`
                        : ""
                    }`}
                  >
                    {cardContent}
                  </Link>
                ) : (
                  <div
                    key={unit.id}
                    style={cardStyle}
                    className={cardClass}
                    aria-label={`Unit ${unit.unitNumber}: no report submitted`}
                    role="img"
                  >
                    {cardContent}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
