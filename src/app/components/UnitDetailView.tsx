'use client'

type Report = {
    residentStatus: string
    responderStatus: string | null
    resourceRequests: string[]
    totalOccupants: number
    occupantsEvacuated: number
    notes: string | null
    submittedAt: Date
    updatedAt: Date
    unit: {
      floor: number
      unitNumber: string
    }
  }

export default function UnitDetailView({
    report, 
    isResponder
  }: {
    report: Report
    isResponder: boolean
  }) {

  }