// test/partner.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DatabaseProvider, DrizzleAsyncProvider } from '../src/drizzle/drizzle.provider';
import { organizations, partners, users } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedPartners } from './seeds/partners';
import { sql } from 'drizzle-orm';

describe('PartnerController (Integration)', () => {
    let app: INestApplication;
    let drizzle: DatabaseProvider;
    let testOrgId: string;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        await drizzle.execute(sql`TRUNCATE TABLE organizations, users, partners CASCADE`);
        await seedOrganizations(drizzle);
        const allOrgs = await drizzle.select().from(organizations);
        testOrgId = allOrgs[0].id;
    });

    describe('POST /partners', () => {
        it('should create a new partner', async () => {
            const createDto = {
                orgId: testOrgId,
                name: 'Cyberdyne Systems',
                vatNr: 'US123456789',
                isCustomer: true,
                email: 'arnold@skynet.com'
            };

            const res = await request(app.getHttpServer())
                .post('/partners')
                .send(createDto);

            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.name).toBe('Cyberdyne Systems');
            expect(res.body.orgId).toBe(testOrgId);
        });
    });

    describe('GET /partners', () => {
        it('should return all partners for an organization', async () => {
            await seedPartners(drizzle, testOrgId);

            const res = await request(app.getHttpServer())
                .get(`/partners?orgId=${testOrgId}`);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
        });
    });

    describe('GET /partners/:id', () => {
        it('should return a specific partner', async () => {
            await seedPartners(drizzle, testOrgId);
            const allPartners = await drizzle.select().from(partners);
            const targetId = allPartners[0].id;

            const res = await request(app.getHttpServer())
                .get(`/partners/${targetId}`);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.id).toBe(targetId);
            expect(res.body.name).toBe(allPartners[0].name);
        });

        it('should return 404 for non-existing partner', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app.getHttpServer())
                .get(`/partners/${fakeId}`);

            expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe('PUT /partners/:id', () => {
        it('should update partner details', async () => {
            await seedPartners(drizzle, testOrgId);
            const allPartners = await drizzle.select().from(partners);
            const targetId = allPartners[0].id;

            const updateDto = { 
                ...allPartners[0], 
                name: 'ACME Updated Name' 
            };

            const res = await request(app.getHttpServer())
                .put(`/partners/${targetId}`)
                .send(updateDto);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.name).toBe('ACME Updated Name');
        });
    });

    describe('DELETE /partners/:id', () => {
        it('should delete a partner', async () => {
            await seedPartners(drizzle, testOrgId);
            const allPartners = await drizzle.select().from(partners);
            const targetId = allPartners[0].id;

            await request(app.getHttpServer())
                .delete(`/partners/${targetId}`)
                .expect(HttpStatus.OK);

            const check = await drizzle.select().from(partners);
            expect(check.length).toBe(1); 
        });
    });

    afterAll(async () => {
        await app.close();
    });
});