'use server'

import { prisma } from '@/lib/prisma'

export async function lookupBuilding(code: string) {
  const building = await prisma.building.findUnique({
    where: { accessCode: code }
  })
  
  if (!building) {
    return { success: false as const, error: "Building not found. Please check your code and try again." }
  }

  return { success: true as const, building }
}