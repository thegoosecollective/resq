/**
 * components/BuildingReportForm.tsx — Resident Safety Report Form
 *
 * Core form for residents to submit or edit their safety status during an emergency.
 * Uses progressive disclosure — fields enable sequentially as previous steps are completed,
 * reducing cognitive load in high-stress situations.
 *
 * Features:
 * - Floor/unit selection with client-side filtering (no extra DB calls)
 * - Occupant count tracking with validation (evacuated cannot exceed total)
 * - Dynamic status buttons — options shown/hidden based on occupant counts
 * - Pet rescue handled separately from people status via resource requests
 * - Pre-populates from existingReport prop when editing a previous submission
 * - Stale warning when user attempts to submit for a different unit than original
 */

"use client";

import { useState } from "react";
import { submitReport } from "@/app/actions/reports";
import { ResidentStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ErrorMessage from "@/app/components/ui/ErrorMessage";
import Select from "@/app/components/ui/Select";
import Button from "@/app/components/ui/Button";

type Unit = {
  id: number;
  floor: number;
  unitNumber: string;
};

type Building = {
  id: number;
  name: string;
  address: string;
};

const statusOptions = [
  {
    value: "evacuated",
    label: "Everyone in my unit is out safely",
    style:
      "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700",
  },
  {
    value: "assistance",
    label: "Some or all of us still need help getting out",
    style:
      "border-amber-500 bg-amber-500 text-slate-900 hover:bg-amber-600 hover:border-amber-600",
  },
  {
    value: "emergency",
    label: "Someone is in immediate life-threatening danger",
    style:
      "border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-700",
  },
];

const requestOptions = [
  { value: "mobility", label: "Mobility assistance" },
  { value: "pet", label: "Pet evacuation" },
  { value: "medical", label: "Medical assistance" },
];

const occupantOptions = Array.from({ length: 15 }, (_, i) => i + 1);

// Progressive disclosure : users can see all form fields but
// only enables after previous question is complete.
// Assists with confusing during high stress situations
export default function BuildingReportForm({
  building,
  units,
  existingReport,
}: {
  building: Building;
  units: Unit[];
  existingReport?: {
    residentStatus: ResidentStatus | null;
    resourceRequests: string[];
    totalOccupants: number;
    occupantsEvacuated: number;
    notes: string | null;
    unitId: number;
    updatedAt: Date;
    unit: {
      floor: number;
      unitNumber: string;
    };
  };
}) {
  const router = useRouter();

  const [selectedFloor, setSelectedFloor] = useState<number | null>(
    existingReport?.unit.floor ?? null
  );
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(
    existingReport?.unitId ?? null
  );
  const [residentStatus, setResidentStatus] = useState<ResidentStatus | null>(
    existingReport?.residentStatus ?? null
  );
  const [resourceRequests, setResourceRequests] = useState<string[]>(
    existingReport?.resourceRequests ?? []
  );
  const [notes, setNotes] = useState<string>(existingReport?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalOccupants, setTotalOccupants] = useState<number | null>(
    existingReport?.totalOccupants ?? null
  );
  const [occupantsEvacuated, setOccupantsEvacuated] = useState<number | null>(
    existingReport?.occupantsEvacuated ?? null
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [staleWarning, setStaleWarning] = useState<Date | null>(null);

  // Pulls from actual unit data instead of building.totalFloors
  // Prevents false data if certain floors don't have units (like amenity floor or rooftop garden)
  const floors = [...new Set(units.map((u) => u.floor))].sort((a, b) => a - b);
  const floorUnits = selectedFloor
    ? units.filter((u) => u.floor === selectedFloor)
    : [];
  const availableResources =
    totalOccupants !== null && occupantsEvacuated === totalOccupants
      ? requestOptions.filter((r) => r.value === "pet")
      : requestOptions;

  function handleTotalOccupantsChange(value: number) {
    setTotalOccupants(value);
    setOccupantsEvacuated(null);
    setResidentStatus(null);
    setFieldErrors((prev) => ({ ...prev, totalOccupants: "" }));
  }

  function handleOccupantsEvacuatedChange(value: number) {
    if (!totalOccupants) return;
    if (value > totalOccupants) {
      setError("Evacuated occupants cannot exceed total occupants.");
      return;
    }
    if (residentStatus === "evacuated" && value !== totalOccupants)
      setResidentStatus(null);
    setError(null);
    setOccupantsEvacuated(value);
  }

  function handleFloorChange(floor: number) {
    setSelectedFloor(floor);
    setSelectedUnitId(null);
    setFieldErrors((prev) => ({ ...prev, floor: "" }));
  }

  function handleStatusChange(status: ResidentStatus) {
    setResidentStatus(status);
    setFieldErrors((prev) => ({ ...prev, status: "" }));
    if (status === "evacuated") setResourceRequests([]);
  }

  function handleUnitIDChange(unit: number) {
    setSelectedUnitId(unit);
    setFieldErrors((prev) => ({ ...prev, unit: "" }));
  }

  function toggleResource(value: string) {
    setResourceRequests((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]
    );
    setFieldErrors((prev) => ({ ...prev, resources: "" }));
  }

  // Upsert: create new report or update existing
  // Resident may submit multiple times during evolving emergency
  async function performSubmit() {
    setFieldErrors({});
    setIsSubmitting(true);
    setError(null);
    const result = await submitReport({
      unitId: selectedUnitId!,
      residentStatus: residentStatus!,
      totalOccupants: totalOccupants ?? 0,
      occupantsEvacuated: occupantsEvacuated ?? 0,
      resourceRequests,
      notes: notes.trim() || undefined,
    });
    if (result.success) {
      router.push(
        `/building/${building.id}/report/confirmation?unitId=${selectedUnitId}`
      );
    } else {
      setError(result.error || "Something went wrong. Please try again.");
    }
    setIsSubmitting(false);
  }

  async function handleConfirmedSubmit() {
    setStaleWarning(null);
    await performSubmit();
  }

  async function handleSubmit() {
    const errors: Record<string, string> = {};
    if (!selectedFloor) errors.floor = "Please select a floor";
    if (!selectedUnitId) errors.unit = "Please select a unit";
    if (!totalOccupants)
      errors.totalOccupants = "Please select total occupants";
    if (occupantsEvacuated === null)
      errors.evacuated = "Please select how many have evacuated";
    if (!residentStatus) errors.status = "Please select a status";
    if (
      (residentStatus === "assistance" || residentStatus === "emergency") &&
      resourceRequests.length === 0
    )
      errors.resources = "Please select at least one resource";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    if (existingReport && selectedUnitId !== existingReport.unitId) {
      setStaleWarning(new Date(existingReport.updatedAt));
      return;
    }
    await performSubmit();
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 space-y-6">
      <h1>Reporting</h1>
      <h3>
        {building.name}: {building.address}
      </h3>
      {/* Global error */}
      <ErrorMessage message={error} />

      {/* Stale warning */}
      {staleWarning && (
        <div className="border-l-4 border-amber-400 bg-amber-50 rounded-lg p-4 space-y-3">
          <p className="font-bold text-amber-800">⚠️ You're changing units</p>
          <p className="text-sm text-amber-700">
            Your original report for Unit {existingReport?.unit.unitNumber} will
            remain in the system.
          </p>
          <p className="text-sm text-amber-700">Continue?</p>
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              onClick={handleConfirmedSubmit}
              variant="primary"
              className="flex-1"
            >
              Yes, continue
            </Button>
            <Button
              type="button"
              onClick={() => setStaleWarning(null)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Edit mode header */}
      {existingReport ? (
        <div className="bg-slate-100 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Editing report
            </p>
            <p className="font-bold text-slate-900 text-lg">
              Unit {existingReport.unit.unitNumber} · Floor{" "}
              {existingReport.unit.floor}
            </p>
          </div>
          <Link
            href={`/building/${building.id}/report`}
            className="text-sm font-bold text-blue-600 underline underline-offset-2"
          >
            Wrong unit?
          </Link>
        </div>
      ) : (
        /* Floor + Unit dropdowns */
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Floor
            </label>
            {fieldErrors.floor && <ErrorMessage message={fieldErrors.floor} />}
            <Select
              value={selectedFloor ?? ""}
              onChange={(e) => handleFloorChange(Number(e.target.value))}
              placeholder="Select your floor"
              options={floors.map((f) => ({ value: f, label: `Floor ${f}` }))}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Unit
            </label>
            {fieldErrors.unit && <ErrorMessage message={fieldErrors.unit} />}
            <Select
              value={selectedUnitId ?? ""}
              onChange={(e) => handleUnitIDChange(Number(e.target.value))}
              disabled={!selectedFloor}
              placeholder="Select your unit"
              options={floorUnits.map((unit) => ({
                value: unit.id,
                label: `Unit ${unit.unitNumber}`,
              }))}
            />
          </div>
        </div>
      )}

      {/* Occupants */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            Total in unit
          </label>
          {fieldErrors.totalOccupants && (
            <ErrorMessage message={fieldErrors.totalOccupants} />
          )}
          <Select
            value={totalOccupants ?? ""}
            onChange={(e) => handleTotalOccupantsChange(Number(e.target.value))}
            disabled={!selectedUnitId}
            placeholder="How many?"
            options={occupantOptions.map((o) => ({ value: o, label: `${o}` }))}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            Already evacuated
          </label>
          {fieldErrors.evacuated && (
            <ErrorMessage message={fieldErrors.evacuated} />
          )}
          <Select
            value={occupantsEvacuated ?? ""}
            onChange={(e) =>
              handleOccupantsEvacuatedChange(Number(e.target.value))
            }
            disabled={!totalOccupants}
            placeholder="How many out?"
            prefixOptions={[{ value: 0, label: "0 — none yet" }]}
            options={occupantOptions
              .filter((n) => n <= (totalOccupants ?? 15))
              .map((o) => ({ value: o, label: `${o}` }))}
          />
        </div>
      </div>

      {/* Status buttons */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">
          Occupant status
        </label>
        <p className="text-sm font-medium text-slate-600 mb-3">
          {totalOccupants !== null && occupantsEvacuated === totalOccupants
            ? "All occupants accounted for. Use resource requests for pet evacuation."
            : "Status refers to people only. Use resource requests for pet evacuation."}
        </p>
        {fieldErrors.status && <ErrorMessage message={fieldErrors.status} />}
        <div className="space-y-3">
          {statusOptions
            .filter((option) => {
              if (
                option.value === "evacuated" &&
                totalOccupants !== null &&
                occupantsEvacuated !== totalOccupants
              )
                return false;
              if (
                (option.value === "assistance" ||
                  option.value === "emergency") &&
                totalOccupants !== null &&
                occupantsEvacuated === totalOccupants
              )
                return false;
              return true;
            })
            .map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={residentStatus === option.value}
                disabled={!selectedUnitId}
                onClick={() =>
                  handleStatusChange(option.value as ResidentStatus)
                }
                className={`w-full text-left px-4 py-3 rounded-lg border-2 font-bold text-sm transition-all
                ${option.style}
                ${
                  residentStatus === option.value
                    ? "ring-4 ring-offset-2 ring-slate-900 scale-[1.02] shadow-lg"
                    : "opacity-75 hover:opacity-100 hover:scale-[1.01]"
                }
                disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer
              `}
              >
                {option.label}
              </button>
            ))}
        </div>
        <p className="text-sm font-medium text-slate-600 mt-2">
          Please select honestly. Accurate status helps responders reach those
          who need help most.
        </p>
      </div>

      {/* Resource requests */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">
          Resource requests
        </label>
        {fieldErrors.resources && (
          <ErrorMessage message={fieldErrors.resources} />
        )}
        <div className="space-y-2">
          {availableResources.map((option) => (
            <label
              key={option.value}
              htmlFor={`resource-${option.value}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all
                ${
                  resourceRequests.includes(option.value)
                    ? "border-blue-400 bg-blue-50 text-blue-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }
                ${
                  residentStatus !== "assistance" &&
                  residentStatus !== "emergency" &&
                  !(
                    residentStatus === "evacuated" &&
                    occupantsEvacuated === totalOccupants
                  )
                    ? "opacity-30 cursor-not-allowed pointer-events-none"
                    : ""
                }
              `}
            >
              <input
                type="checkbox"
                id={`resource-${option.value}`}
                value={option.value}
                checked={resourceRequests.includes(option.value)}
                onChange={() => toggleResource(option.value)}
                disabled={
                  residentStatus !== "assistance" &&
                  residentStatus !== "emergency" &&
                  !(
                    residentStatus === "evacuated" &&
                    occupantsEvacuated === totalOccupants
                  )
                }
                className="w-4 h-4 accent-blue-600"
              />
              <span className="font-medium text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">
          Additional notes{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          value={notes}
          disabled={!residentStatus}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Non-ambulatory, oxygen tank present, located in back bedroom..."
          className="w-full border-2 border-slate-200 rounded-lg p-3 h-28 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        />
      </div>

      {/* Submit */}
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        variant="primary"
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : "Submit Safety Report"}
      </Button>
    </div>
  );
}
