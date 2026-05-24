/**
 * lib/prisma.ts — Prisma Client Singleton
 *
 * Initializes a single PrismaClient instance using the PrismaPg adapter.
 *
 * Singleton pattern prevents multiple client instances during hot reload in development.
 *
 * In production, a new instance is created once and reused across requests.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
