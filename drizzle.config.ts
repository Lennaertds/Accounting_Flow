// drizzle.config.ts

import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

// Gebruik CLI_DATABASE_URL als die bestaat (voor specifieke commando's), anders de standaard DATABASE_URL.
// Dit laadt de variabelen uit het .env bestand in de root.
const dbUrl = process.env.CLI_DATABASE_URL || process.env.DATABASE_URL;

if (!dbUrl) {
    throw new Error('DATABASE_URL or CLI_DATABASE_URL is not set');
}

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/drizzle/schema.ts',
    out: './migrations',
    dbCredentials: {
        url: dbUrl,
    },
});