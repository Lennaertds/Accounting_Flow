// backend/test/vat-code.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DrizzleAsyncProvider } from '../src/drizzle/drizzle.provider';
import { organizations, vatCodes } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedVatCodes, clearVatCodes } from './seeds/vat-codes';
import { seedUsers } from './seeds/users';
import { loginAdmin } from './helpers/login';
import { sql, eq, and } from 'drizzle-orm';

describe('VatCodeController (Integration)', () => {
    let app: INestApplication;
    let drizzle: any;
    let adminToken: string;
    let testOrgId: string;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        await drizzle.execute(sql`TRUNCATE TABLE pepol_app.organizations, pepol_app.users, pepol_app.vat_codes CASCADE`);
        await seedOrganizations(drizzle);
        const allOrgs = await drizzle.select().from(organizations);
        testOrgId = allOrgs[0].id; 
        await seedUsers(app, drizzle, testOrgId);
        adminToken = await loginAdmin(app);
        await seedVatCodes(drizzle, testOrgId);
    });

    describe('POST /api/vat-codes', () => {
        it('should create a new VAT code for the authenticated organization', async () => {
            const createDto = {
                orgId: testOrgId,
                code: 'NEW-VAT-99',
                rate: 99.00,
                description: 'Super Tax',
                taxDeclarationBox: 99
            };

            const res = await request(app.getHttpServer())
                .post('/api/vat-codes')
                .auth(adminToken, { type: 'bearer' })
                .send(createDto);

            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.code).toBe('NEW-VAT-99');
            expect(res.body.orgId).toBe(testOrgId);
            // Database geeft decimal terug als string
            expect(res.body.rate).toBe("99.00");
        });
    });

    describe('GET /api/vat-codes', () => {
        it('should return all VAT codes for the users organization', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/vat-codes')
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body.every((v: any) => v.orgId === testOrgId)).toBe(true);
        });
    });

    describe('GET /api/vat-codes/:id', () => {
        it('should return a specific VAT code by ID', async () => {
            const existing = await drizzle.select().from(vatCodes).where(eq(vatCodes.orgId, testOrgId));
            const targetId = existing[0].id;

            const res = await request(app.getHttpServer())
                .get(`/api/vat-codes/${targetId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.id).toBe(targetId);
            expect(res.body.code).toBe(existing[0].code);
        });

        it('should return 404 when trying to access a VAT code from another organization', async () => {
            const allOrgs = await drizzle.select().from(organizations);
            const otherOrgId = allOrgs[1].id;
            
            await seedVatCodes(drizzle, otherOrgId);
            const otherCodes = await drizzle.select().from(vatCodes).where(eq(vatCodes.orgId, otherOrgId));
            const targetId = otherCodes[0].id;

            const res = await request(app.getHttpServer())
                .get(`/api/vat-codes/${targetId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe('PUT /api/vat-codes/:id', () => {
        it('should update VAT code details', async () => {
            const existing = await drizzle.select().from(vatCodes).where(eq(vatCodes.orgId, testOrgId));
            const targetId = existing[0].id;

            const updateDto = {
                rate: 25.00,
                description: 'Updated Tax Rate',
                taxDeclarationBox: 5
            };

            const res = await request(app.getHttpServer())
                .put(`/api/vat-codes/${targetId}`)
                .auth(adminToken, { type: 'bearer' })
                .send(updateDto);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.rate).toBe("25.00");
            expect(res.body.description).toBe('Updated Tax Rate');
        });
    });

    describe('DELETE /api/vat-codes/:id', () => {
        it('should delete a VAT code and return 200', async () => {
            const existing = await drizzle.select().from(vatCodes).where(eq(vatCodes.orgId, testOrgId));
            const targetId = existing[0].id;

            const res = await request(app.getHttpServer())
                .delete(`/api/vat-codes/${targetId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);

            const check = await drizzle.select().from(vatCodes).where(eq(vatCodes.id, targetId));
            expect(check.length).toBe(0);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});