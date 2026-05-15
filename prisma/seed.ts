import crypto from 'crypto'
import { prisma } from '../lib/prisma'

async function main() {

    const buildingName = "Evergreen";
    const buildingAddress = "3193 Springfield Avenue"
    const buildingFloors = 19;
    const buildingAccessCode = crypto.randomBytes(4).toString('hex');
    let unit;

     //build new building with ID
    const newBuilding = await prisma.building.create({
        data:{
            name : buildingName,
            accessCode : buildingAccessCode,
            totalFloors : buildingFloors,
            address : buildingAddress
        },
    })
   
    //build IDs
    for (let i = 1; i <= 19; i++) {
        for (let j = 1; j <= 9; j++) {
            unit = i * 100 + j
            await prisma.unit.create({
                data:{
                    buildingId: newBuilding.id,
                    floor: i,
                    unitNumber : unit,
                    emergencyContactEmail: "papiniu@outlook.com"
                 }  
            });
        }
    }
}

main()
.catch(console.error)
.finally(() => prisma.$disconnect())
