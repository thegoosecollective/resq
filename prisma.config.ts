import path from 'path'
import type { PrismaConfig } from 'prisma'

export default {
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
} satisfies PrismaConfig