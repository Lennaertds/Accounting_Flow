// test/e2e/bank-statement.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app'; // Pas pad aan indien nodig
import { DrizzleAsyncProvider } from '../src/drizzle/drizzle.provider';
import { organizations, bankStatements } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedBankStatements } from './seeds/bank-statements';
import { seedUsers } from './seeds/users';
import { loginAdmin } from './helpers/login';
import { sql } from 'drizzle-orm';

describe('BankStatementController (E2E)', () => {
    let app: INestApplication;
    let drizzle: any;
    let adminToken: string;
    let testOrgId: string;
    let otherOrgId: string;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        await drizzle.execute(sql`TRUNCATE TABLE pepol_app.organizations, pepol_app.users, pepol_app.bank_statements CASCADE`);
        
        await seedOrganizations(drizzle);
        const allOrgs = await drizzle.select().from(organizations);
        testOrgId = allOrgs[0].id;  // ALPHA
        otherOrgId = allOrgs[1].id; // BETA
        await seedUsers(app, drizzle, testOrgId);
        adminToken = await loginAdmin(app);
    });

    describe('POST /bank-statements', () => {
        it('should create a bank statement for the authenticated org', async () => {
            const createDto = {
                orgId: testOrgId,
                date: '2026-03-29',
                amount: '500.00',
                communication: 'Factuur 2026-001',
                bankReference: 'REF-UNIQUE-123'
            };

            const res = await request(app.getHttpServer())
                .post('/bank-statements')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createDto);

            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.orgId).toBe(testOrgId);
            expect(res.body.bankReference).toBe('REF-UNIQUE-123');
        });
    });

    describe('GET /bank-statements', () => {
        it('should return only statements for the current org', async () => {
            await seedBankStatements(drizzle, testOrgId, 'ALPHA');
            await seedBankStatements(drizzle, otherOrgId, 'BETA');

            const res = await request(app.getHttpServer())
                .get('/bank-statements')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.length).toBeGreaterThan(0);
            res.body.forEach((stmt: any) => {
                expect(stmt.orgId).toBe(testOrgId);
            });
            const containsOtherOrg = res.body.some((stmt: any) => stmt.orgId === otherOrgId);
            expect(containsOtherOrg).toBe(false);
        });
    });

    describe('GET /bank-statements/:id', () => {
        it('should return 404 when accessing a statement from another org', async () => {
            await seedBankStatements(drizzle, otherOrgId, 'BETA');
            const betaStatements = await drizzle.select().from(bankStatements);
            const targetId = betaStatements.find((s: any) => s.orgId === otherOrgId).id;

            const res = await request(app.getHttpServer())
                .get(`/bank-statements/${targetId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe('PUT /bank-statements/:id', () => {
        it('should update a statement successfully', async () => {
            await seedBankStatements(drizzle, testOrgId, 'ALPHA');
            const myStatements = await drizzle.select().from(bankStatements);
            const targetId = myStatements[0].id;

            const updateDto = {
                communication: 'Updated Mededeling',
                amount: '999.99'
            };

            const res = await request(app.getHttpServer())
                .put(`/bank-statements/${targetId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateDto);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.communication).toBe('Updated Mededeling');
            expect(res.body.amount).toBe('999.99');
        });
    });

    describe('DELETE /bank-statements/:id', () => {
        it('should delete a statement from own org', async () => {
            await seedBankStatements(drizzle, testOrgId, 'ALPHA');
            const myStatements = await drizzle.select().from(bankStatements);
            const targetId = myStatements[0].id;

            const res = await request(app.getHttpServer())
                .delete(`/bank-statements/${targetId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(HttpStatus.OK);

            const check = await drizzle.select().from(bankStatements).where(sql`id = ${targetId}`);
            expect(check.length).toBe(0);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});