'use server'

import { prisma } from '@/lib/prisma'
import { ResidentStatus, ResponderStatus } from '@prisma/client'

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

export async function getReportByUnitID(id: number) {
  return await prisma.report.findUnique({
    where: { unitId: id },
    include: {
      unit: {
        include: {
          building: true
        }
      }
    }})
}


export async function updateResponderStatus({
  unitId,
  responderStatus,
}: {
  unitId: number
  responderStatus: ResponderStatus
}) {
  try {
    const data: any = { responderStatus }
    if (responderStatus === 'evacuated') {
      const existing = await prisma.report.findUnique({ where: { unitId } })
      if (existing) {
        data.occupantsEvacuated = existing.totalOccupants
      }
    }

    const updated = await prisma.report.update({
      where: { unitId },
      data,
    })
    return { success: true, report: updated }
  } catch (error) {
    console.error('FULL ERROR:', JSON.stringify(error, null, 2))
    return { success: false, error: 'Failed to update status.' }
  }
}