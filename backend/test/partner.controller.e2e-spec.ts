// src/partner.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DrizzleAsyncProvider } from '../src/drizzle/drizzle.provider';
import { organizations, partners, users } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedPartners } from './seeds/partners';
import { seedUsers } from './seeds/users';
import { loginAdmin } from './helpers/login';
import { sql } from 'drizzle-orm';

describe('PartnerController (Integration)', () => {
    let app: INestApplication;
    let drizzle: any;
    let adminToken: string;
    let testOrgId: string;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        await drizzle.execute(sql`TRUNCATE TABLE pepol_app.organizations, pepol_app.users, pepol_app.partners CASCADE`);
        await seedOrganizations(drizzle);
        const allOrgs = await drizzle.select().from(organizations);
        testOrgId = allOrgs[0].id; 
        await seedUsers(app, drizzle, testOrgId);
        adminToken = await loginAdmin(app);
        await seedPartners(drizzle, testOrgId);
    });

    describe('POST /api/partners', () => {
        it('should create a partner linked to the users org', async () => {
            const createDto = {
                orgId: testOrgId,
                name: 'Cyberdyne Systems',
                isCustomer: true,
                isSupplier: false,
            };

            const res = await request(app.getHttpServer())
                .post('/api/partners')
                .auth(adminToken, { type: 'bearer' })
                .send(createDto);

            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.orgId).toBe(testOrgId);
            expect(res.body.name).toBe('Cyberdyne Systems');
        });
    });

    describe('GET /api/partners', () => {
        it('should return only partners for the authenticated users organization', async () => {
            await seedPartners(drizzle, testOrgId);

            const res = await request(app.getHttpServer())
                .get('/api/partners')
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0].orgId).toBe(testOrgId);
        });
    });

    describe('GET /api/partners/:id', () => {
        it('should return a specific partner', async () => {
            await seedPartners(drizzle, testOrgId);
            const allPartners = await drizzle.select().from(partners);
            const targetId = allPartners[0].id;

            const res = await request(app.getHttpServer())
                .get(`/api/partners/${targetId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.id).toBe(targetId);
        });

        it('should return 404 when partner belongs to another org', async () => {
            const allOrgs = await drizzle.select().from(organizations);
            const otherOrgId = allOrgs[1].id;
            await seedPartners(drizzle, otherOrgId);
            
            const otherPartners = await drizzle.select().from(partners);
            const targetId = otherPartners.find(p => p.orgId === otherOrgId).id;

            const res = await request(app.getHttpServer())
                .get(`/api/partners/${targetId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe('PUT /api/partners/:id', () => {
        it('should update partner details', async () => {
            await seedPartners(drizzle, testOrgId);
            const allPartners = await drizzle.select().from(partners);
            const targetId = allPartners[0].id;

            const updateDto = {
                name: 'Skynet Industries',
                orgId: testOrgId,
                isCustomer: false
            };

            const res = await request(app.getHttpServer())
                .put(`/api/partners/${targetId}`)
                .auth(adminToken, { type: 'bearer' })
                .send(updateDto);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.name).toBe('Skynet Industries');
            expect(res.body.isCustomer).toBe(false);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});