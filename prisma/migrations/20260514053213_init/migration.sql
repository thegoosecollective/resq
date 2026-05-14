-- CreateEnum
CREATE TYPE "ResidentStatus" AS ENUM ('evacuated', 'assistance', 'emergency');

-- CreateEnum
CREATE TYPE "ResponderStatus" AS ENUM ('in_progress', 'evacuated', 'deceased');

-- CreateTable
CREATE TABLE "Building" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "accessCode" TEXT NOT NULL,
    "totalFloors" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" SERIAL NOT NULL,
    "buildingId" INTEGER NOT NULL,
    "floor" INTEGER NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "emergencyContactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "unitId" INTEGER NOT NULL,
    "residentStatus" "ResidentStatus" NOT NULL,
    "responderStatus" "ResponderStatus",
    "resourceRequests" TEXT[],
    "notes" TEXT,
    "ipAddress" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Building_accessCode_key" ON "Building"("accessCode");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_buildingId_floor_unitNumber_key" ON "Unit"("buildingId", "floor", "unitNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Report_unitId_key" ON "Report"("unitId");

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
