import { PrismaClient } from '@prisma/client'

export { prisma as db };

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
  }
  
  export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: ['query'], // Optional: good for debugging
    })
  
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma



// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.
