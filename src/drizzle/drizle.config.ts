import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/pepol_db',
  },
  // Dit zorgt ervoor dat Drizzle het multi-schema setup begrijpt
  schemaFilter: ["pepol_app", "pepol_dwh"],
});