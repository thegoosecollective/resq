/**
 * components/UnitDetailView.tsx — Unit Detail View
 *
 * Role-aware display of a single unit's report. Family members see status,
 * occupant counts and resource requests. First responders additionally see
 * resident notes and controls to update responder attendance status.
 * 
 * Handles units with no resident report — responders can still mark attendance.
 * 
 * Optimistic UI — status updates locally immediately, reverts on server failure.
 */

"use client";

import { useState } from "react";
import { ResponderStatus } from "@prisma/client";
import {
  getResourceLabel,
  getResponderStatusDisplay,
  getStatusDisplay,
} from "@/lib/reportUtils";
import { updateResponderStatus } from "@/app/actions/reports";
import { useRouter } from "next/navigation";

const responderStatusOptions = [
  {
    value: "evacuated",
    label: "All evacuated",
    style: "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700",
  },
  {
    value: "in_progress",
    label: "In progress",
    style: "border-amber-500 bg-amber-500 text-slate-900 hover:bg-amber-600",
  },
  {
    value: "deceased",
    label: "Deceased",
    style: "border-slate-700 bg-slate-700 text-white hover:bg-slate-800",
  },
];

type Report = {
  unitId: number;
  residentStatus: string | null;
  responderStatus: string | null;
  resourceRequests: string[];
  totalOccupants: number;
  occupantsEvacuated: number;
  notes: string | null;
  submittedAt: Date;
  updatedAt: Date;
  unit: {
    floor: number;
    unitNumber: string;
  };
};

export default function UnitDetailView({
  report,
  isResponder,
  unitId,
}: {
  report: Report | null;
  isResponder: boolean;
  unitId: number;
}) {
  const router = useRouter();

  const [responderStatus, setResponderStatus] =
    useState<ResponderStatus | null>(
      (report?.responderStatus as ResponderStatus | null) ?? null
    );

  async function handleResponderStatusChange(status: ResponderStatus) {
    setResponderStatus(status);
    const result = await updateResponderStatus({
      unitId: report?.unitId ?? unitId,
      responderStatus: status,
    });
    if (result.success) {
      router.refresh();
    } else {
      setResponderStatus(
        (report?.responderStatus as ResponderStatus | null) ?? null
      );
      alert("Failed to update status. Please try again.");
    }
  }

  // No report — responder only view
  if (!report && isResponder) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="w-full max-w-lg mx-auto space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              Unit Detail
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              No report submitted
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              This unit has not submitted a safety report. You can still update
              the responder status below.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <p className="text-sm font-bold text-slate-700">
              Update responder status
            </p>
            <div className="space-y-3">
              {responderStatusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    handleResponderStatusChange(option.value as ResponderStatus)
                  }
                  aria-pressed={responderStatus === option.value}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 font-bold text-sm transition-all cursor-pointer
                    ${option.style}
                    ${
                      responderStatus === option.value
                        ? "ring-4 ring-offset-2 ring-slate-900 scale-[1.02] shadow-lg"
                        : "opacity-75 hover:opacity-100"
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!report) return null;

  const { colour, label, textColour } = getStatusDisplay(
    report.residentStatus,
    report.resourceRequests,
    report.responderStatus,  
    isResponder              
  )

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            Unit Detail
          </p>
          <h1 className="text-2xl font-bold text-slate-900">
            Unit {report.unit.unitNumber} · Floor {report.unit.floor}
          </h1>
        </div>

        {/* Resident status badge */}
        <div
          className="w-full py-4 px-6 rounded-xl text-center font-bold text-lg"
          style={{ backgroundColor: colour, color: textColour }}
          role="status"
          aria-label={`Resident status: ${label}`}
        >
          {label}
        </div>

        {/* Responder update — family view */}
        {!isResponder && report.responderStatus && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">
              Responder update
            </p>
            <p className="font-bold text-blue-900">
              {getResponderStatusDisplay(report.responderStatus, false)}
            </p>
          </div>
        )}

        {/* Report details card */}
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          <dl>
            {/* Timestamps */}
            <div className="px-5 py-4 flex justify-between">
              <dt className="text-base font-bold text-slate-600">Submitted</dt>
              <dd
                className="text-base font-medium text-slate-900"
                suppressHydrationWarning
              >
                {new Date(report.submittedAt).toLocaleString()}
              </dd>
            </div>

            <div className="px-5 py-4 flex justify-between">
              <dt className="text-base font-bold text-slate-600">
                Last updated
              </dt>
              <dd
                className="text-base font-medium text-slate-900"
                suppressHydrationWarning
              >
                {new Date(report.updatedAt).toLocaleString()}
              </dd>
            </div>

            {/* Occupants */}
            {report.totalOccupants > 0 && (
              <div className="px-5 py-4 flex justify-between">
                <dt className="text-base font-bold text-slate-600">
                  Evacuated
                </dt>
                <dd className="text-base font-medium text-slate-900">
                  {report.occupantsEvacuated} of {report.totalOccupants}
                </dd>
              </div>
            )}
          </dl>

          {/* Resource requests */}
          <div className="px-5 py-4">
            <p className="text-base font-bold text-slate-600 mb-2">
              Resource requests
            </p>
            {report.resourceRequests.length > 0 ? (
              <ul aria-label="Resource requests" className="space-y-1">
                {report.resourceRequests.map((r) => (
                  <li key={r} className="text-base font-medium text-slate-900">
                    {getResourceLabel(r)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base font-medium text-slate-400">None</p>
            )}
          </div>

          {/* Notes — responders only */}
          {report.notes && isResponder && (
            <div className="px-5 py-4">
              <p className="text-base font-bold text-slate-600 mb-1">Notes</p>
              <p className="text-base font-medium text-slate-900">
                {report.notes}
              </p>
            </div>
          )}
        </div>

        {/* Responder status section */}
        {isResponder && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            {/* Current responder status */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                Current responder status
              </p>
              <p className="text-lg font-bold text-slate-900">
                {responderStatus
                  ? getResponderStatusDisplay(responderStatus, true)
                  : "Not yet attended"}
              </p>
            </div>

            {/* Update buttons */}
            <div>
              <p className="text-sm font-bold text-slate-700 mb-3">
                Update status:
              </p>
              <div className="space-y-3">
                {responderStatusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      handleResponderStatusChange(
                        option.value as ResponderStatus
                      )
                    }
                    aria-pressed={responderStatus === option.value}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 font-bold text-sm transition-all cursor-pointer
                      ${option.style}
                      ${
                        responderStatus === option.value
                          ? "ring-4 ring-offset-2 ring-slate-900 scale-[1.02] shadow-lg"
                          : "opacity-75 hover:opacity-100"
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
