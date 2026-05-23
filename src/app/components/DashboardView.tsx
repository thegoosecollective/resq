'use client'
import { useState } from 'react';
import { getStatusDisplay } from '@/lib/reportUtils'
import Link from 'next/link'


type Report = {
    residentStatus: string
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
    units
  }: {
    building: Building
    units: Unit[]
  }) {
    
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null)

  // derived data
  const floors = [...new Set(units.map(u => u.floor))].sort((a, b) => a - b)
  const visibleUnits = selectedFloor
    ? units.filter(u => u.floor === selectedFloor)
    : units

  return (
<div>
<h1>{building.name} - {building.address}</h1>
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
<div>         
{visibleUnits.map(unit => {
  const { colour, label } = getStatusDisplay(
    unit.report?.residentStatus ?? null,
    unit.report?.resourceRequests ?? []
  )

  return (
    <Link
      key={unit.id}
      href={`/building/${building.id}/unit/${unit.id}`}
      style={{ backgroundColor: colour }}
    >
      <p>Unit {unit.unitNumber}</p>
      <p>{label}</p>
      {unit.report && (
        <p>{unit.report.occupantsEvacuated} of {unit.report.totalOccupants} out</p>
      )}
    </Link>
  )
})}
</div>
</div>  
)
}