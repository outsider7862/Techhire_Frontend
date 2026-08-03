# Database migrations

This project uses Prisma Migrate, but **`prisma migrate dev` does not work
here** — use the `migrate deploy` based flow described below.

## Why not `migrate dev`?

Supabase Auth owns the `auth.users` table. To link our `Profile` rows to it
(and cascade-delete a Profile when its auth user is deleted), there is a
cross-schema foreign key: `public.Profile.id → auth.users.id`, created by raw
SQL in the Supabase dashboard (see the Supabase Auth setup).

`prisma migrate dev` runs a drift check that introspects the live database.
It cannot represent that cross-schema reference and fails with:

```
Error: P4002 ... public.Profile points to auth.users in constraint
profile_id_fkey. Please add `auth` to your `schemas` property ...
```

We deliberately do **not** add `auth` to Prisma's `schemas`: with multi-schema
enabled, Prisma would diff the `auth` schema too and — since we don't model
`auth.users` — could generate a `DROP TABLE auth.users`. That risk is not
worth it. So we bypass the drift check by authoring migration SQL ourselves
and applying it with `migrate deploy`, which only applies pending migration
files and does not introspect for drift.

## Creating a migration

1. Edit `prisma/schema.prisma`.

2. Create the migration folder and SQL file. Name it
   `prisma/migrations/<UTC-timestamp>_<slug>/migration.sql`, e.g.
   `prisma/migrations/20260801093000_add_widget/migration.sql`. Use a
   timestamp later than the newest existing migration.

3. Write the SQL. For simple changes (add column, add table, add index) just
   write the DDL by hand in Prisma's style — look at the existing files under
   `prisma/migrations/` for the exact shape. For a complex change you can
   generate the SQL with `migrate diff` **against a throwaway shadow
   database** (a scratch Postgres or a second, empty Supabase project) — this
   avoids touching the real DB, so it sidesteps the P4002 problem:

   ```bash
   npx prisma migrate diff \
     --from-migrations ./prisma/migrations \
     --to-schema-datamodel ./prisma/schema.prisma \
     --shadow-database-url "$SHADOW_DATABASE_URL" \
     --script > prisma/migrations/<timestamp>_<slug>/migration.sql
   ```

4. Apply it and regenerate the client:

   ```bash
   npm run db:migrate
   ```

   (`prisma migrate deploy && prisma generate`.)

5. Confirm and commit:

   ```bash
   npm run db:migrate:status   # should say "Database schema is up to date!"
   ```

   Commit the schema change **and** the new `prisma/migrations/...` folder
   together.

## How migrations run on deploy

`vercel-build` (`prisma migrate deploy && next build`) runs the migrations
before building. Vercel prefers `vercel-build` over `build`, so a Vercel
deploy applies any pending migrations automatically, while a local
`npm run build` stays offline. This requires `DIRECT_URL` (the non-pooled
connection — see `prisma.config.ts`) to be set in the deploy environment.

On any host that is **not** Vercel, run `prisma migrate deploy` as part of the
release step yourself — it won't pick up `vercel-build`.

## First deploy to a fresh database

A brand-new database (e.g. production Supabase) also needs the one-time raw
SQL that Prisma can't manage: the `auth.users` foreign key and the
`handle_new_user` trigger that populates `Profile` on signup. Run that in the
Supabase SQL editor **before** the first `migrate deploy`, or the
`Profile → auth.users` FK the app relies on won't exist.
