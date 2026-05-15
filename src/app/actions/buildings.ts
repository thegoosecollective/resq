'use server'  // ← tells Next.js this runs on the server

export async function lookupBuilding(code: string) {
  const building = await prisma.building.findUnique({
    where: { accessCode: code }
  })
  return building
}