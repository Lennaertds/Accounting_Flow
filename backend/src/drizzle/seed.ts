// backend/src/drizzle/seed.ts
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { DatabaseProvider, DrizzleAsyncProvider } from './drizzle.provider';
import { eq } from 'drizzle-orm';
import * as schema from './schema';
import { SEED_ORGANIZATIONS, SEED_USERS, SEED_VAT_CODES } from './seed-data';

async function bootstrap() {
    const logger = new Logger('SeedScript');
    logger.log('--- 🚀 Starting Seeding Process ---');

    let app;
    try {
        app = await NestFactory.createApplicationContext(AppModule);
    } catch (err) {
        logger.error('❌ Failed to create NestJS context.');
        throw err;
    }

    try {
        const authService = app.get(AuthService);
        const db: DatabaseProvider = app.get(DrizzleAsyncProvider);
        // 1. OPRUIMEN (Cascade delete van boven naar beneden)
        logger.log('🧹 1/4: Cleaning existing data...');
        await db.delete(schema.users);
        await db.delete(schema.vatCodes);
        await db.delete(schema.organizations);

        // 2. SEED ORGANIZATIONS
        logger.log('🌱 2/4: Seeding organizations...');
        const orgMap = new Map<string, string>(); // name -> id

        for (const orgData of SEED_ORGANIZATIONS) {
            const [insertedOrg] = await db.insert(schema.organizations).values({
                name: orgData.name,
                vat: orgData.vat,
                iban: orgData.iban
            }).returning();
            orgMap.set(insertedOrg.name, insertedOrg.id);
        }
        logger.log(`✅ Inserted ${orgMap.size} organizations.`);

        // 3. SEED USERS (Via AuthService voor hashing!)
        logger.log('🌱 3/4: Seeding users via AuthService...');
        for (const seedUser of SEED_USERS) {
            const orgId = orgMap.get(seedUser.orgId);
            if (orgId) {
                await authService.register({
                    orgId: seedUser.orgId,
                    email: seedUser.email,
                    password: 'passwoord123',
                    firstName: seedUser.firstName,
                    lastName: seedUser.lastName,
                    role: seedUser.role as any,
                });
            }
        }
        logger.log(`✅ Users registered.`);

        // 4. SEED VAT CODES (Per organisatie)
        logger.log('🌱 4/4: Seeding VAT codes for each organization...');
        for (const [orgName, orgId] of orgMap.entries()) {
            const vatValues = SEED_VAT_CODES.map(v => ({
                orgId: orgId,
                code: v.code, 
                rate: v.rate,
                description: v.description,
                taxDeclarationBox: v.taxDeclarationBox
            }));

    await db.insert(schema.vatCodes).values(vatValues);
}

        logger.log('--- ✨ Seeding Complete! ---');
    } catch (err) {
        logger.error('--- ❌ SEEDING PROCESS FAILED ---');
        console.error(err);
        process.exit(1);
    } finally {
        if (app) await app.close();
    }
}

bootstrap();