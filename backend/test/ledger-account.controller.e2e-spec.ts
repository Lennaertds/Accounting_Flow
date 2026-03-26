// test/e2e/ledger-account.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DrizzleAsyncProvider } from '../src/drizzle/drizzle.provider';
import { organizations, ledgerAccounts } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedLedgerAccounts } from './seeds/ledger-accounts';
import { seedUsers } from './seeds/users';
import { loginAdmin } from './helpers/login';
import { sql, eq } from 'drizzle-orm';
import { LedgerCategory } from '../src/accounting/ledger-account.dto';

describe('LedgerAccountController (Integration)', () => {
    let app: INestApplication;
    let drizzle: any;
    let adminToken: string;
    let testOrgId: string;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        // Tabellen opschonen in de juiste volgorde
        await drizzle.execute(sql`TRUNCATE TABLE pepol_app.organizations, pepol_app.users, pepol_app.ledger_accounts CASCADE`);
        
        // Setup basis data
        await seedOrganizations(drizzle);
        const allOrgs = await drizzle.select().from(organizations);
        testOrgId = allOrgs[0].id; 
        
        // User aanmaken en inloggen
        await seedUsers(app, drizzle, testOrgId);
        adminToken = await loginAdmin(app);
        
        // Standaard rekeningschema seeden voor deze organisatie
        await seedLedgerAccounts(drizzle, testOrgId);
    });

    describe('POST /api/ledger-accounts', () => {
        it('should create a ledger account linked to the users org', async () => {
            const createDto = {
                code: 700001,
                name: 'Extra Omzet',
                category: LedgerCategory.REVENUE,
                orgId: testOrgId,
            };

            const res = await request(app.getHttpServer())
                .post('/api/ledger-accounts')
                .auth(adminToken, { type: 'bearer' })
                .send(createDto);

            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.orgId).toBe(testOrgId);
            expect(res.body.code).toBe(700001);
        });

        it('should return 409 Conflict when creating a duplicate code for same org', async () => {
            const createDto = {
                code: 700000, // Deze zit al in de SEED_LEDGER_ACCOUNTS
                name: 'Dubbele Rekening',
                category: LedgerCategory.REVENUE,
                orgId: testOrgId,
            };

            const res = await request(app.getHttpServer())
                .post('/api/ledger-accounts')
                .auth(adminToken, { type: 'bearer' })
                .send(createDto);

            expect(res.statusCode).toBe(HttpStatus.CONFLICT);
        });
    });

    describe('GET /api/ledger-accounts', () => {
        it('should return only accounts for the authenticated users organization', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/ledger-accounts')
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body.every((acc: any) => acc.orgId === testOrgId)).toBe(true);
        });
    });

    describe('GET /api/ledger-accounts/:id', () => {
        it('should return a specific ledger account', async () => {
            const allAccounts = await drizzle.select().from(ledgerAccounts).where(eq(ledgerAccounts.orgId, testOrgId));
            const targetId = allAccounts[0].id;

            const res = await request(app.getHttpServer())
                .get(`/api/ledger-accounts/${targetId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.id).toBe(targetId);
        });

        it('should return 404 when ledger account belongs to another org', async () => {
            const allOrgs = await drizzle.select().from(organizations);
            const otherOrgId = allOrgs[1].id;
            await seedLedgerAccounts(drizzle, otherOrgId);
            
            const otherAccounts = await drizzle.select().from(ledgerAccounts).where(eq(ledgerAccounts.orgId, otherOrgId));
            const targetId = otherAccounts[0].id;

            const res = await request(app.getHttpServer())
                .get(`/api/ledger-accounts/${targetId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe('PUT /api/ledger-accounts/:id', () => {
        it('should update ledger account name', async () => {
            const allAccounts = await drizzle.select().from(ledgerAccounts).where(eq(ledgerAccounts.orgId, testOrgId));
            const targetId = allAccounts[0].id;

            const updateDto = {
                name: 'Aangepaste Naam',
            };

            const res = await request(app.getHttpServer())
                .put(`/api/ledger-accounts/${targetId}`)
                .auth(adminToken, { type: 'bearer' })
                .send(updateDto);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.name).toBe('Aangepaste Naam');
        });
    });

    describe('DELETE /api/ledger-accounts/:id', () => {
        it('should remove the account', async () => {
            const allAccounts = await drizzle.select().from(ledgerAccounts).where(eq(ledgerAccounts.orgId, testOrgId));
            const targetId = allAccounts[0].id;

            const res = await request(app.getHttpServer())
                .delete(`/api/ledger-accounts/${targetId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);
            
            const check = await drizzle.select().from(ledgerAccounts).where(eq(ledgerAccounts.id, targetId));
            expect(check.length).toBe(0);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});