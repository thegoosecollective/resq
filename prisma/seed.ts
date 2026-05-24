import crypto from 'crypto'
import { prisma } from '../src/lib/prisma'
import { ResidentStatus, ResponderStatus } from '@prisma/client'

// Realistic notes that might appear during an emergency
const EVACUATION_NOTES = [
  'Left via stairwell B, currently in the lobby',
  'Evacuated with dog, waiting outside main entrance',
  'Out safely, waiting across the street',
  null,
  null,
  null,
]

const ASSISTANCE_NOTES = [
  'Elderly resident, unable to use stairs. Located in bedroom.',
  'Two young children, need help with stroller down stairs.',
  'Resident on oxygen tank. Medical assistance required immediately.',
  'Wheelchair user. Located near front door of unit, ready for evacuation.',
  'Resident has mobility issues. Waiting by door.',
  'Guest visiting, unfamiliar with building exits.',
  null,
  null,
]

const EMERGENCY_NOTES = [
    'My roommate has collapsed and is unresponsive. I think she needs CPR. I am in the hallway.',
    'Smoke is coming under the door. Door handle is hot. We cannot get out.',
    'My husband fell and is trapped under the bookshelf. He is conscious but cannot move.',
    'My mother has dementia and is refusing to leave. I cannot carry her alone.',
    'Severe allergic reaction. Used EpiPen but still getting worse. Need ambulance immediately.',
  ]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  const buildingName = 'Evergreen'
  const buildingAddress = '3193 Springfield Avenue'
  const buildingFloors = 19
  const buildingAccessCode = crypto.randomBytes(4).toString('hex')

  // Create building
  const newBuilding = await prisma.building.upsert({
    where: { address: buildingAddress },
    update: {},
    create: {
      name: buildingName,
      accessCode: buildingAccessCode,
      totalFloors: buildingFloors,
      address: buildingAddress,
    },
  })

  console.log(`\n Building: ${newBuilding.name}`)
  console.log(`Access code: ${newBuilding.accessCode}`)
  console.log(`Seeding ${buildingFloors * 9} units...\n`)

  const units: { id: number; floor: number }[] = []

  // Create all units
  for (let floor = 1; floor <= buildingFloors; floor++) {
    for (let j = 1; j <= 9; j++) {
      const unitData = {
        buildingId: newBuilding.id,
        floor,
        unitNumber: String(floor * 100 + j),
      }

      const unit = await prisma.unit.upsert({
        where: { buildingId_floor_unitNumber: unitData },
        update: {},
        create: unitData,
      })

      units.push({ id: unit.id, floor })
    }
  }

  console.log(`${units.length} units created\n`)

  // Delete existing reports so we can re-seed cleanly
  await prisma.report.deleteMany({
    where: { unitId: { in: units.map(u => u.id) } },
  })

  // Seed reports — roughly 65% of units have reported
  // Realistic emergency scenario: fire alarm pulled 45 mins ago
  // Most residents have reported, some haven't, responders are actively working

  let reportCount = 0
  const submittedAt = new Date(Date.now() - 45 * 60 * 1000) // 45 mins ago

  for (const unit of units) {
    // 65% chance of having a report
    if (Math.random() > 0.65) continue

    // Status distribution — mostly evacuated, some need help, few critical
    const rand = Math.random()
    let residentStatus: ResidentStatus
    let responderStatus: ResponderStatus | null = null
    let resourceRequests: string[] = []
    let notes: string | null = null
    let totalOccupants: number
    let occupantsEvacuated: number

    if (rand < 0.60) {
      // 60% evacuated safely
      residentStatus = 'evacuated'
      totalOccupants = randomInt(1, 4)
      occupantsEvacuated = totalOccupants

      // Some have pet rescue
      if (Math.random() < 0.08) {
        resourceRequests = ['pet']
      }

      notes = randomItem(EVACUATION_NOTES)

      // Some evacuated units have been confirmed by responder
      if (Math.random() < 0.4) {
        responderStatus = 'evacuated'
      }

    } else if (rand < 0.85) {
      // 25% needs assistance
      residentStatus = 'assistance'
      totalOccupants = randomInt(1, 5)
      occupantsEvacuated = randomInt(0, totalOccupants - 1)

      // Resource requests — most have at least one
      const possible = ['mobility', 'pet', 'medical']
      resourceRequests = possible.filter(() => Math.random() < 0.4)
      if (resourceRequests.length === 0) resourceRequests = [randomItem(possible)]

      notes = randomItem(ASSISTANCE_NOTES)

      // Some in progress by responder
      if (Math.random() < 0.35) {
        responderStatus = 'in_progress'
      }

    } else if (rand < 0.95) {
      // 10% emergency
      residentStatus = 'emergency'
      totalOccupants = randomInt(1, 3)
      occupantsEvacuated = 0

      resourceRequests = ['medical']
      if (Math.random() < 0.3) resourceRequests.push('mobility')

      notes = randomItem(EMERGENCY_NOTES)

      // Most emergency units have responder attending
      if (Math.random() < 0.6) {
        responderStatus = 'in_progress'
      }

    } else {
      // 5% deceased — responder confirmed
      residentStatus = 'emergency'
      totalOccupants = randomInt(1, 2)
      occupantsEvacuated = 0
      notes = randomItem(EMERGENCY_NOTES)
      resourceRequests = []
      responderStatus = 'deceased'
    }

    // Slightly randomise submission time — not everyone submitted at same time
    const unitSubmittedAt = new Date(
      submittedAt.getTime() + randomInt(0, 30) * 60 * 1000
    )

    await prisma.report.create({
      data: {
        unitId: unit.id,
        residentStatus,
        responderStatus,
        resourceRequests,
        notes,
        totalOccupants,
        occupantsEvacuated,
        submittedAt: unitSubmittedAt,
        updatedAt: unitSubmittedAt,
      },
    })

    reportCount++
  }

  // --- Guaranteed pet rescue units for demo ---
  const petUnits = [
    { floor: 3, unitNumber: '301', notes: 'Two cats hiding under the bed. They will not come out on their own.', resources: ['pet'] },
    { floor: 7, unitNumber: '702', notes: 'Iguana in cage beside the bedroom dresser. Handle with care — bites when stressed.', resources: ['pet', 'mobility'] },
    { floor: 12, unitNumber: '1205', notes: "Golden retriever — favourite hiding spot is beside the bathroom. Responds to 'Biscuit'.", resources: ['pet'] },
    { floor: 5, unitNumber: '504', notes: 'Three guinea pigs in a cage on the kitchen counter. Cage has a latch on top.', resources: ['pet'] },
    { floor: 15, unitNumber: '1508', notes: 'Elderly parrot in large cage in living room. Cage is too heavy to carry alone — needs two people.', resources: ['pet', 'mobility'] },
  ]

  for (const pet of petUnits) {
    const unit = units.find(u => u.floor === pet.floor)
    if (!unit) continue

    const petOccupants = randomInt(1, 3)

    await prisma.report.upsert({
      where: { unitId: unit.id },
      update: {
        residentStatus: 'evacuated',
        resourceRequests: pet.resources,
        notes: pet.notes,
        totalOccupants: petOccupants,
        occupantsEvacuated: petOccupants,
        responderStatus: null,
      },
      create: {
        unitId: unit.id,
        residentStatus: 'evacuated',
        resourceRequests: pet.resources,
        notes: pet.notes,
        totalOccupants: petOccupants,
        occupantsEvacuated: petOccupants,
        responderStatus: null,
        submittedAt: submittedAt,
        updatedAt: submittedAt,
      },
    })
  }

  console.log(`🐾 ${petUnits.length} pet rescue units seeded`)

  console.log(`Report summary:`)
  console.log(`   Total units: ${units.length}`)
  console.log(`   Units reporting: ${reportCount} (${Math.round(reportCount / units.length * 100)}%)`)
  console.log(`   Units not yet reported: ${units.length - reportCount}`)
  console.log(`\nAccess code: ${newBuilding.accessCode}`)
  console.log(`Responder portal: /responder\n`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())