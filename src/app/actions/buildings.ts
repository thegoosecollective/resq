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

//only gets ID
export async function getBuildingById(id: number) {
  const building = await prisma.building.findUnique({
    where: { id }
  })
  return building
}

//gets building + unit count
export async function getBuildingWithUnits(id: number) {
  return await prisma.building.findUnique({
    where: { id },
    include: {
      units: {
        orderBy: [{ floor: 'asc' }, { unitNumber: 'asc' }],
      },
    },
  })
}