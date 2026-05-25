/**
 * report/confirmation/page.tsx — Report Confirmation Page
 *
 * Displays a summary of the resident's submitted report including status,
 * occupant counts, resource requests, and any responder updates.
 * 
 * Always renders from the resident/family perspective (isResponder: false)
 * Deceased status is masked, responder operational details are hidden.
 */

import { notFound } from 'next/navigation'
import { getReportByUnitID } from '@/app/actions/reports'
import { getStatusDisplay, getResponderStatusDisplay, getResourceLabel } from '@/lib/reportUtils'
import Link from 'next/link'

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

  const { colour, label, textColour } = getStatusDisplay(
    report.residentStatus,
    report.resourceRequests,
    report.responderStatus,
    false // always family/resident view — masks deceased
  )

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Report submitted</p>
          <h1 className="text-2xl font-bold text-slate-900">
            Unit {report.unit.unitNumber} · Floor {report.unit.floor}
          </h1>
          <p className="text-sm font-medium text-slate-500">
            {report.unit.building.name} · {report.unit.building.address}
          </p>
        </div>

        {/* Status badge */}
        <div
          className="w-full py-4 px-6 rounded-xl text-center font-bold text-lg"
          style={{ backgroundColor: colour, color: textColour }}
          role="status"
          aria-label={`Current status: ${label}`}
        >
          {label}
        </div>

        {/* Responder update */}
        {report.responderStatus && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">Responder update</p>
            <p className="font-bold text-blue-900">
              {getResponderStatusDisplay(report.responderStatus, false)}
            </p>
          </div>
        )}

        {/* Report details card */}
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          <dl>

            {/* Submitted */}
            <div className="px-5 py-4 flex justify-between">
              <dt className="text-base font-bold text-slate-600">Submitted</dt>
              <dd className="text-base font-medium text-slate-900" suppressHydrationWarning>
                {new Date(report.submittedAt).toLocaleString()}
              </dd>
            </div>

            {/* Last updated */}
            <div className="px-5 py-4 flex justify-between">
              <dt className="text-base font-bold text-slate-600">Last updated</dt>
              <dd className="text-base font-medium text-slate-900" suppressHydrationWarning>
                {new Date(report.updatedAt).toLocaleString()}
              </dd>
            </div>

            {/* Occupants */}
            {report.totalOccupants > 0 && (
              <div className="px-5 py-4 flex justify-between">
                <dt className="text-base font-bold text-slate-600">Evacuated</dt>
                <dd className="text-base font-medium text-slate-900">
                  {report.occupantsEvacuated}/{report.totalOccupants}
                </dd>
              </div>
            )}

            {/* Resource requests */}
            <div className="px-5 py-4">
              <dt className="text-base font-bold text-slate-600 mb-2">Resource requests</dt>
              <dd>
                {report.resourceRequests.length > 0 ? (
                  <ul aria-label="Resource requests" className="space-y-1">
                    {report.resourceRequests.map(r => (
                      <li key={r} className="text-base font-medium text-slate-900">
                        {getResourceLabel(r)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-base font-medium text-slate-400">None</p>
                )}
              </dd>
            </div>

            {/* Notes */}
            {report.notes && (
              <div className="px-5 py-4">
                <dt className="text-base font-bold text-slate-600 mb-1">Notes</dt>
                <dd className="text-base font-medium text-slate-900">{report.notes}</dd>
              </div>
            )}

          </dl>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            aria-label="Edit your safety report"
            href={`/building/${id}/report?unitId=${report.unitId}`}
            className="flex-1 block text-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg border-2 border-blue-600 hover:bg-transparent hover:text-blue-600 transition-colors"
          >
            Edit report
          </Link>
          <Link
            aria-label="Report was submitted for wrong unit"
            href={`/building/${id}/report`}
            className="flex-1 block text-center px-6 py-3 bg-transparent text-slate-700 font-bold rounded-lg border-2 border-slate-300 hover:border-slate-500 transition-colors"
          >
            Wrong unit?
          </Link>
        </div>

      </div>
    </main>
  )
}