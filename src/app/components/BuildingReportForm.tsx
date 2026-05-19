'use client'

import { useState } from 'react'
import { submitReport } from '@/app/actions/reports'
import { ResidentStatus } from '@prisma/client'

type Unit = {
    id: number
    floor: number
    unitNumber: string
}
  
type Building = {
    id: number
    name: string
    address: string
}
  
  export default function BuildingReportForm({
    building,
    units,
  }: {
    building: Building
    units: Unit[]
  }) {


  };