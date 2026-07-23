import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        // Prisma Migrate needs a true direct connection, not the pooled one —
        // PgBouncer's transaction mode doesn't support what Migrate needs.
        // This is separate from what the running app connects with at
        // runtime (see lib/prisma.ts, which uses the pooled DATABASE_URL).
        url: env("DIRECT_URL"),
    },
});