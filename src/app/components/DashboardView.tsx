'use client'
import { useState } from 'react';
import { getStatusDisplay } from '@/lib/reportUtils'
import Link from 'next/link'
import Select from '@/app/components/ui/Select'

type Report = {
  residentStatus: string
  responderStatus: string | null 
  resourceRequests: string[]
  totalOccupants: number
  occupantsEvacuated: number
}
  
type Unit = {
  id: number
  floor: number
  unitNumber: string
  report: Report | null  
}
  
type Building = {
  id: number
  name: string
  address: string
}

const statusFilterOptions = [
  { value: 'emergency', label: '🔴 Critical' },
  { value: 'assistance', label: '🟡 Assistance' },
  { value: 'evacuated', label: '🟢 Evacuated' },
  { value: 'pet_rescue', label: '🔵 Pet rescue' },
  { value: 'in_progress', label: '🟠 In progress' },
  { value: 'none', label: '⚪ No report' },
  { value: 'deceased', label: '🖤 Deceased' },
]

export default function DashboardView({
  building,
  units,
  isResponder
}: {
  building: Building
  units: Unit[]
  isResponder: boolean
}) {
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
  const reportedCount = units.filter(u => u.report !== null).length
  const totalCount = units.length
  const emergencyCount = units.filter(u => u.report?.residentStatus === 'emergency').length
  const assistanceCount = units.filter(u => u.report?.residentStatus === 'assistance').length

  const floors = [...new Set(units.map(u => u.floor))].sort((a, b) => a - b)
  const visibleUnits = units
    .filter(u => selectedFloor ? u.floor === selectedFloor : true)
    .filter(u => {
      if (!statusFilter) return true
      if (statusFilter === 'none') return u.report === null
      if (statusFilter === 'pet_rescue') return (
        u.report?.residentStatus === 'evacuated' && 
        u.report?.resourceRequests.includes('pet')
      )
      return u.report?.residentStatus === statusFilter ||
             u.report?.responderStatus === statusFilter
    })

  return (
    <div>
      <h1>{building.name} - {building.address}</h1>
      <p>{reportedCount}/{totalCount} units reporting</p>
      {isResponder && (
        <p>🔴 {emergencyCount} critical · 🟡 {assistanceCount} need assistance</p>
      )}

      {/* Floor dropdown */}
      <Select
        value={selectedFloor ?? ''}
        onChange={e => setSelectedFloor(e.target.value ? Number(e.target.value) : null)}
        placeholder="All floors"
        options={floors.map(f => ({ value: f, label: `Floor ${f}` }))}
      />

      {/* Status filter — responders only */}
      {isResponder && (
        <Select
          value={statusFilter ?? ''}
          onChange={e => setStatusFilter(e.target.value || null)}
          placeholder="All statuses"
          options={statusFilterOptions}
        />
      )}

      {/* Unit grid */}
      <div>         
        {visibleUnits.map(unit => {
          const { colour, label } = getStatusDisplay(
            unit.report?.residentStatus ?? null,
            unit.report?.resourceRequests ?? [],
            unit.report?.responderStatus ?? null,
            isResponder
          )

          return (
            unit.report || isResponder ? (
              <Link
                key={unit.id}
                href={isResponder 
                  ? `/building/${building.id}/unit/${unit.id}?responder=true`
                  : `/building/${building.id}/unit/${unit.id}`
                }
                style={{ backgroundColor: colour }}
              >
                <p>{unit.unitNumber}</p>
                {unit.report && unit.report.totalOccupants > 0 && (
                  <p>{unit.report.occupantsEvacuated}/{unit.report.totalOccupants}</p>
                )}
              </Link>
            ) : (
              <div key={unit.id} style={{ backgroundColor: colour }}>
                <p>{unit.unitNumber}</p>
                {!unit.report && <p>{label}</p>}
              </div>
            )
          )
        })}
      </div>  
    </div>  
  )
}