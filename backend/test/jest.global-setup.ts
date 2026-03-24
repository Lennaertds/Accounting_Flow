// test/jest.global-setup.ts
import { execSync } from 'child_process';
import { resolve } from 'path';
import * as dotenv from 'dotenv';
import { Client } from 'pg'; 

dotenv.config({ path: resolve(__dirname, '..', '.env.test') });

export default async function globalSetup() {
    console.log('\n--- Setting up E2E Test Environment (Docker Compose) ---');

    // 1. Wachten tot de database echt bereikbaar is
    console.log('⏳ 1/3: Waiting for Postgres to be ready...');
    
    const client = new Client({
        connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5433/papertrade_test",
    });

    let authenticated = false;
    let retries = 10;

    while (!authenticated && retries > 0) {
        try {
            await client.connect();
            authenticated = true;
            await client.end();
        } catch (err) {
            retries--;
            if (retries === 0) {
                console.error('❌ Could not connect to the test database.');
                throw err;
            }
            await new Promise((res) => setTimeout(res, 1000));
        }
    }

    // 2. Voer de migraties uit
    console.log('✅ Database is up! ⏳ 2/3: Running migrations...');
    execSync('pnpm db:push:test', {
        stdio: 'inherit',
        cwd: resolve(__dirname, '..', '..')
    });

    // 3. Voer de seeding uit
    console.log('🌱 3/3: Seeding the isolated Test DB...');
    execSync('pnpm db:seed:test', {
        stdio: 'inherit',
        cwd: resolve(__dirname, '..', '..')
    });

    console.log('✅ Setup complete. Tests starting...');
}