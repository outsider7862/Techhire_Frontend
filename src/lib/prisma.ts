import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 requires connecting through an explicit driver adapter — the
// old "just reads DATABASE_URL from schema.prisma automatically" behavior
// is gone. This is the pooled connection (via Supabase's PgBouncer) that
// the running app actually queries through; migrations use a separate,
// direct connection configured in prisma.config.ts instead.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}