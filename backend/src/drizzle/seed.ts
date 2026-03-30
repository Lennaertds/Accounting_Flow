// backend/src/drizzle/seed.ts
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { DatabaseProvider, DrizzleAsyncProvider } from './drizzle.provider';
import { sql, eq, and } from 'drizzle-orm';
import * as schema from './schema';
import * as data from './seed-data';

async function bootstrap() {
    const logger = new Logger('SeedScript');
    logger.log('--- 🚀 Starting Full Seeding Process ---');

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

        // 1. OPRUIMEN (CASCADE zorgt voor de rest)
        logger.log('🧹 1/7: Cleaning existing data...');
        await db.execute(sql`TRUNCATE TABLE pepol_app.organizations CASCADE`);

        // 2. ORGANIZATIONS
        logger.log('🌱 2/7: Seeding Organizations...');
        const orgMap = new Map<string, string>();
        for (const org of data.SEED_ORGANIZATIONS) {
            const [inserted] = await db.insert(schema.organizations).values({ name: org.name, vat: org.vat, iban: org.iban }).returning();
            orgMap.set(org.seedKey, inserted.id);
        }

        // 3. USERS & VAT & ANALYTICS
        logger.log('🌱 3/7: Seeding Core Dimensions (Users, VAT, Analytics)...');
        for (const u of data.SEED_USERS) {
            await authService.register({ ...u, orgId: orgMap.get(u.orgSeedKey)! });
        }
        
        for (const v of data.SEED_VAT_CODES) {
            await db.insert(schema.vatCodes).values({ ...v, orgId: orgMap.get(v.orgSeedKey)! });
        }

        const analyticMap = new Map<string, string>();
        for (const a of data.SEED_ANALYTIC_ACCOUNTS) {
            const [inserted] = await db.insert(schema.analyticAccounts).values({ ...a, orgId: orgMap.get(a.orgSeedKey)! }).returning();
            analyticMap.set(`${a.orgSeedKey}:${a.code}`, inserted.id);
        }

        // 4. PARTNERS (Suppliers & Customers)
        logger.log('🌱 4/7: Seeding Partners...');
        const partnerMap = new Map<string, string>();
        for (const p of data.SEED_PARTNERS) {
            const [inserted] = await db.insert(schema.partners).values({ ...p, orgId: orgMap.get(p.orgSeedKey)! }).returning();
            partnerMap.set(`${p.orgSeedKey}:${p.name}`, inserted.id);
        }

        // 5. LEDGER (Journals & Accounts)
        logger.log('🌱 5/7: Seeding P3 Ledger Structure...');
        const journalMap = new Map<string, string>();
        for (const j of data.SEED_JOURNALS) {
            const [inserted] = await db.insert(schema.journals).values({ ...j, orgId: orgMap.get(j.orgSeedKey)! }).returning();
            journalMap.set(`${j.orgSeedKey}:${j.code}`, inserted.id);
        }

        const ledgerMap = new Map<string, string>();
        for (const l of data.SEED_LEDGER_ACCOUNTS) {
            const [inserted] = await db.insert(schema.ledgerAccounts).values({ ...l, orgId: orgMap.get(l.orgSeedKey)! }).returning();
            ledgerMap.set(`${l.orgSeedKey}:${l.code}`, inserted.id);
        }

        // 6. DOCUMENTS (Invoices & Orders - P1, P2, P4, P5)
        logger.log('🌱 6/7: Seeding Documents (Invoices & Orders)...');
        const allVats = await db.select().from(schema.vatCodes);

        for (const inv of data.SEED_INCOMING_INVOICES) {
            const orgId = orgMap.get(inv.orgSeedKey)!;
            const vatId = allVats.find(v => v.code === inv.vatCode && v.orgId === orgId)?.id!;
            await db.insert(schema.incomingInvoices).values({
                ...inv, orgId, vatCodeId: vatId,
                supplierId: partnerMap.get(`${inv.orgSeedKey}:${inv.supplierName}`)!
            });
        }

        for (const inv of data.SEED_OUTGOING_INVOICES) {
            const orgId = orgMap.get(inv.orgSeedKey)!;
            const vatId = allVats.find(v => v.code === inv.vatCode && v.orgId === orgId)?.id!;
            await db.insert(schema.outgoingInvoices).values({
                ...inv, orgId, vatCodeId: vatId,
                customerId: partnerMap.get(`${inv.orgSeedKey}:${inv.customerName}`)!
            });
        }

        for (const ord of data.SEED_INCOMING_ORDERS) {
            await db.insert(schema.incomingOrders).values({
                ...ord, orgId: orgMap.get(ord.orgSeedKey)!,
                customerId: partnerMap.get(`${ord.orgSeedKey}:${ord.customerName}`)!
            });
        }

        for (const ord of data.SEED_OUTGOING_ORDERS) {
            await db.insert(schema.outgoingOrders).values({
                ...ord, orgId: orgMap.get(ord.orgSeedKey)!,
                supplierId: partnerMap.get(`${ord.orgSeedKey}:${ord.supplierName}`)!
            });
        }

        // 7. BANKING & LOGS
        logger.log('🌱 7/7: Seeding Banking & Follow-up Logs...');
        for (const stmt of data.SEED_BANK_STATEMENTS) {
            await db.insert(schema.bankStatements).values({ ...stmt, orgId: orgMap.get(stmt.orgSeedKey)! });
        }

        for (const log of data.SEED_FOLLOW_UP_LOGS) {
            const orgId = orgMap.get(log.orgSeedKey)!;
            const [user] = await db.select().from(schema.users).where(and(eq(schema.users.email, log.userEmail), eq(schema.users.orgId, orgId)));
            if (user) {
                await db.insert(schema.followUpLogs).values({
                    orgId, userId: user.id, actionTaken: log.actionTaken, statusAfterAction: log.statusAfterAction
                });
            }
        }

        logger.log('--- ✨ All 5 Pillars & Matching Seeded Successfully! ---');

    } catch (err) {
        logger.error('--- ❌ SEEDING FAILED ---');
        console.error(err);
        process.exit(1);
    } finally {
        if (app) await app.close();
    }
}

bootstrap();