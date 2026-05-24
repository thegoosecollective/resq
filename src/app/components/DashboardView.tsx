'use client'
import { useState } from 'react';
import { getStatusDisplay } from '@/lib/reportUtils'
import Link from 'next/link'

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
  // derived data
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
{/*Floor dropdown*/}
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">
      Floor
    </label>
    <select
  value={selectedFloor ?? ''}
  onChange={e => setSelectedFloor(e.target.value ? Number(e.target.value) : null)}
>
      <option value="">Select your floor</option>
      {floors.map(floor => (
        <option key={floor} value={floor}>Floor {floor}</option>
      ))}
    </select>
</div>
{/*Unit display*/}
{/* Status filter */}
{isResponder && (
  <div>
    <label>Filter by status:</label>
    <select
      value={statusFilter ?? ''}
      onChange={e => setStatusFilter(e.target.value || null)}
    >
      <option value="">All</option>
      <option value="emergency">🔴 Critical</option>
      <option value="assistance">🟡 Assistance</option>
      <option value="evacuated">🟢 Evacuated</option>
      <option value="pet_rescue">🔵 Pet rescue</option>
      <option value="in_progress">🟠 In progress</option>
      <option value="none">⚪ No report</option>
      <option value="deceased">🖤 Deceased</option>
    </select>
  </div>
)}
<div>         
{visibleUnits.map(unit => {
 const { colour, label } = getStatusDisplay(
  unit.report?.residentStatus ?? null,
  unit.report?.resourceRequests ?? [],
  unit.report?.responderStatus ?? null,
  isResponder
)

  return (
    <Link
      key={unit.id}
      href={isResponder 
        ? `/building/${building.id}/unit/${unit.id}?responder=true`
        : `/building/${building.id}/unit/${unit.id}`
      }
    
      style={{ backgroundColor: colour }}
    >
      <p>{unit.unitNumber}</p>
      {unit.report && (
        <p>{unit.report.occupantsEvacuated}/{unit.report.totalOccupants}</p>
      )}
    </Link>
  )
})}
</div>
</div>  
)
}