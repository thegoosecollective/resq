'use server'

import { prisma } from '@/lib/prisma'
import { ResidentStatus } from '@prisma/client'

export async function submitReport({
  unitId,
  residentStatus,
  totalOccupants,
  occupantsEvacuated,
  resourceRequests,
  notes,
}: {
  unitId: number
  residentStatus: ResidentStatus
  resourceRequests: string[]
  totalOccupants: number
  occupantsEvacuated: number
  notes?: string
})
 {
  try {
    const report = await prisma.report.upsert({
      where: { unitId },
      update: { residentStatus, 
                resourceRequests, 
                totalOccupants,
                occupantsEvacuated,
                notes, 
                updatedAt: new Date() 
            },
      create: { unitId, 
                residentStatus, totalOccupants,
                occupantsEvacuated,
                resourceRequests, notes },
    })
    return { success: true, report }
  }  catch (error) {
    console.error('FULL ERROR:', JSON.stringify(error, null, 2))

    return { success: false, error: 'Failed to submit report. Please try again' }
  }
}

export async function getReportByUnitID(id: number){
  const report = await prisma.report.findUnique({
    where: { unitId: id }
  })
  return report
}