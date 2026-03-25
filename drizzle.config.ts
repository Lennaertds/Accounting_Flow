// drizzle.config.ts

import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    throw new Error('DATABASE_URL is not set');
}

export default defineConfig({
    dialect: 'postgresql',
    schema: './backend/src/drizzle/schema.ts',
    out: './backend/migrations',
    schemaFilter: ["pepol_app", "pepol_dwh"], 
    dbCredentials: {
        url: dbUrl,
    },
});