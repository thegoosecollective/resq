import crypto from 'crypto'
import { prisma } from '../lib/prisma'

async function main() {

    const buildingName = "Evergreen";
    const buildingAddress = "3193 Springfield Avenue"
    const buildingFloors = 19;
    const buildingAccessCode = crypto.randomBytes(4).toString('hex');


     //build new building with ID
    const newBuilding = await prisma.building.upsert({
        where: { address: buildingAddress },
        update: {},  
        create:{
            name : buildingName,
            accessCode : buildingAccessCode,
            totalFloors : buildingFloors,
            address : buildingAddress
        },
    })
   
    console.log(`Building created: ${newBuilding.name}`)
    console.log(`Access code: ${newBuilding.accessCode}`)
    console.log(`Total units to seed: ${buildingFloors * 9}`)

    //build IDs
    for (let i = 1; i <= 19; i++) {
        for (let j = 1; j <= 9; j++) {
            const unitData = {
                buildingId: newBuilding.id,
                floor: i,
                unitNumber: String(i * 100 + j)
            }

            await prisma.unit.upsert({
                where: {
                    buildingId_floor_unitNumber: unitData
                  },
                update: {},  
                create: {
                    ...unitData,
                    emergencyContactEmail: "papiniu@outlook.com"
                  }
            });
        }
    }
}

main()
.catch(console.error)
.finally(() => prisma.$disconnect())
