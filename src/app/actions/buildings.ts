/**
 * buildings.ts — Server Actions: Building & Unit Data
 *
 * Handles all database read operations for buildings and their units.
*
 * Functions:
 * - lookupBuilding(code)        Validates building access code, returns building if found
 * - getBuildingById(id)         Fetches building metadata only (name, address) — role selection page
 * - getBuildingWithUnits(id)    Fetches building + all units — report form dropdown population
 * - getBuildingReports(id)      Fetches building + units + nested reports — dashboard grid
 */

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

//Only gets ID
export async function getBuildingById(id: number) {
  const building = await prisma.building.findUnique({
    where: { id }
  })
  return building
}

//Gets building + unit count
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

//Getting reports for all units on dashboard
export async function getBuildingReports(id: number) {
  return await prisma.building.findUnique({
    where: { id },
    include: {
      units: {
        orderBy: [{ floor: 'asc' }, { unitNumber: 'asc' }],
        include: {
          report: true  
        }
      }
    }
  })
}