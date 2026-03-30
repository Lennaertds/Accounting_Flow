// backend/test/analytic-account.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DrizzleAsyncProvider } from '../src/drizzle/drizzle.provider';
import { organizations, analyticAccounts } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedUsers } from './seeds/users';
import { seedAnalyticAccounts } from './seeds/analytic-accounts';
import { loginAdmin } from './helpers/login';
import { sql, eq } from 'drizzle-orm';

describe('AnalyticAccountController (Integration)', () => {
    let app: INestApplication;
    let drizzle: any;
    let adminToken: string;
    let testOrgId: string;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        await drizzle.execute(sql`TRUNCATE TABLE pepol_app.organizations, pepol_app.users, pepol_app.analytic_accounts CASCADE`);
        await seedOrganizations(drizzle);
        const allOrgs = await drizzle.select().from(organizations);
        testOrgId = allOrgs[0].id; 
        await seedUsers(app, drizzle, testOrgId);
        adminToken = await loginAdmin(app);
        await seedAnalyticAccounts(drizzle, testOrgId);
    });

    describe('POST /api/analytic-accounts', () => {
        it('should create an analytic account linked to the users org', async () => {
            const createDto = {
                orgId: testOrgId,
                name: 'R&D Afdeling',
                code: 'RD-2026',
            };

            const res = await request(app.getHttpServer())
                .post('/api/analytic-accounts')
                .auth(adminToken, { type: 'bearer' })
                .send(createDto);

            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.orgId).toBe(testOrgId);
            expect(res.body.name).toBe('R&D Afdeling');
            expect(res.body.code).toBe('RD-2026');
        });
    });

    describe('GET /api/analytic-accounts', () => {
        it('should return only analytic accounts for the authenticated organization', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/analytic-accounts')
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0].orgId).toBe(testOrgId);
        });
    });

    describe('PUT /api/analytic-accounts/:id', () => {
        it('should update analytic account details', async () => {
            const allAccounts = await drizzle.select().from(analyticAccounts);
            const targetId = allAccounts[0].id;

            const updateDto = {
                name: 'Marketing - Europa Updated',
            };

            const res = await request(app.getHttpServer())
                .put(`/api/analytic-accounts/${targetId}`)
                .auth(adminToken, { type: 'bearer' })
                .send(updateDto);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.name).toBe('Marketing - Europa Updated');
        });

        it('should return 404 when updating an account from another org', async () => {
            const allOrgs = await drizzle.select().from(organizations);
            const otherOrgId = allOrgs[1].id;
            
            const [otherAccount] = await drizzle.insert(analyticAccounts)
                .values({ name: 'Secret Project', code: 'TOP-SEC', orgId: otherOrgId })
                .returning();

            const res = await request(app.getHttpServer())
                .put(`/api/analytic-accounts/${otherAccount.id}`)
                .auth(adminToken, { type: 'bearer' })
                .send({ name: 'Hacked' });

            expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe('DELETE /api/analytic-accounts/:id', () => {
        it('should delete a cost center successfully', async () => {
            const allAccounts = await drizzle.select().from(analyticAccounts);
            const targetId = allAccounts[0].id;

            const res = await request(app.getHttpServer())
                .delete(`/api/analytic-accounts/${targetId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);

            const check = await drizzle.select().from(analyticAccounts).where(eq(analyticAccounts.id, targetId));
            expect(check.length).toBe(0);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});