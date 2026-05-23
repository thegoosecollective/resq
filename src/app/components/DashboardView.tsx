'use client'
import { useState } from 'react';
import { getStatusDisplay } from '@/lib/reportUtils'
import { ResidentStatus } from '@prisma/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { report } from 'process';

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
    
</div>  )
}