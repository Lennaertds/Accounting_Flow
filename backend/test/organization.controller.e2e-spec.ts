// test/organization.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DrizzleAsyncProvider } from '../src/drizzle/drizzle.provider';
import { organizations } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedUsers } from './seeds/users';
import { login, loginAdmin } from './helpers/login';
import { sql } from 'drizzle-orm';

describe('OrganizationController (Integration)', () => {
    let app: INestApplication;
    let drizzle: any;
    let adminToken: string;
    let viewerToken: string;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        await drizzle.execute(sql`TRUNCATE TABLE pepol_app.organizations, pepol_app.users CASCADE`);
        await seedOrganizations(drizzle);
        const allOrgs = await drizzle.select().from(organizations);
        const testOrgId = allOrgs[0].id;
        await seedUsers(app, drizzle, testOrgId);

        adminToken = await loginAdmin(app);
        viewerToken = await login(app, 'boss@beta.com', 'password123');
    });

    describe('Access Control', () => {
        it('should deny GET /organizations for non-admins', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/organizations')
                .auth(viewerToken, { type: 'bearer' });
            expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
        });
    });

    describe('POST /organizations', () => {
        it('should allow ADMIN to create an organization', async () => {
            const payload = {
                name: 'New Startup',
                myVatNr: 'BE0111222333',
                myIban: 'BE68123412341234'
            };

            const res = await request(app.getHttpServer())
                .post('/api/organizations')
                .auth(adminToken, { type: 'bearer' })
                .send(payload);

            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.name).toBe('New Startup');
        });
    });

    describe('GET /organizations/:id', () => {
        it('should return a specific organization when authenticated', async () => {
            const allOrgs = await drizzle.select().from(organizations);
            const targetId = allOrgs[0].id;

            const res = await request(app.getHttpServer())
                .get(`/api/organizations/${targetId}`)
                .auth(viewerToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.id).toBe(targetId);
        });

        it('should return 404 for non-existent UUID', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app.getHttpServer())
                .get(`/api/organizations/${fakeId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});