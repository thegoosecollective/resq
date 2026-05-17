'use server'

import { prisma } from '@/lib/prisma'
import { ResidentStatus } from '@prisma/client'

export async function submitReport({
  unitId,
  residentStatus,
  resourceRequests,
  notes,
}: {
  unitId: number
  residentStatus: ResidentStatus
  resourceRequests: string[]
  notes?: string
}) {
  try {
    const report = await prisma.report.upsert({
      where: { unitId },
      update: { residentStatus, 
                resourceRequests, 
                notes, 
                updatedAt: new Date() 
            },
      create: { unitId, 
                residentStatus, 
                resourceRequests, notes },
    })
    return { success: true, report }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to submit report. Please try again' }
  }
}