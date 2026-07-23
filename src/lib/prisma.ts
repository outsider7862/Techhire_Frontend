import { PrismaClient } from "@prisma/client";

// Standard Next.js singleton pattern: in dev, hot-reload re-executes this
// module on every save, which would otherwise open a new PrismaClient (and
// a new connection pool) each time. Stashing it on `globalThis` keeps one
// instance alive across reloads. Not needed in production (one instance
// per serverless invocation anyway), but harmless there too.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
