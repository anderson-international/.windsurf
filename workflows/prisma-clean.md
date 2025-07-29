---
description: Fully delete the prisma cache and regenerate the schema and client from the database
---

To fully clean and regenerate your Prisma schema and client without losing existing database data, follow these npm-based steps:

1. Delete Prisma cache and generated artifact directories:
   - Remove `node_modules/.prisma`
   - Remove `node_modules/@prisma`
   - Remove `node_modules/.cache` (if present)
   - Remove `prisma/generated` (if used)

2. Clear the npm cache:
   - Run `npm cache clean --force`

3. Remove installed dependencies and lockfile:
   - Delete `node_modules` directory
   - Delete `package-lock.json` file

4. Reinstall dependencies:
   - Run `npm install`

5. Optionally synchronize your Prisma schema with the current database state, if manual database changes occurred:
   - Run `npx prisma db pull`

6. Regenerate your Prisma client artifacts from the updated schema:
   - Run `npx prisma generate`

Omit any commands that reset or migrate the database (such as `npx prisma migrate reset`) to preserve your data.

This sequence ensures all Prisma caches and generated files are cleared and recreated cleanly, maintaining alignment with your existing database without destructive resets.