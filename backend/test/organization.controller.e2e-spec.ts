// test/organization.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DatabaseProvider, DrizzleAsyncProvider } from '../src/drizzle/drizzle.provider';
import { organizations } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { sql } from 'drizzle-orm';

describe('OrganizationController (Integration)', () => {
    let app: INestApplication;
    let drizzle: DatabaseProvider;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        await drizzle.execute(sql`TRUNCATE TABLE organizations, users CASCADE`);
    });

    describe('POST /organizations', () => {
        it('should create a new organization', async () => {
            const payload = {
                name: 'Startup Inc',
                myVatNr: 'NL888888888B01',
                myIban: 'NL99INGB0001234567'
            };

            const res = await request(app.getHttpServer())
                .post('/organizations')
                .send(payload);

            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.name).toBe('Startup Inc');
            expect(res.body.id).toBeDefined();
        });
    });

    describe('GET /organizations', () => {
        it('should return all organizations', async () => {
            await seedOrganizations(drizzle);

            const res = await request(app.getHttpServer())
                .get('/organizations');

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
        });
    });

    describe('GET /organizations/:id', () => {
        it('should return a specific organization', async () => {
            await seedOrganizations(drizzle);
            
            const allOrgs = await drizzle.select().from(organizations);
            const targetId = allOrgs[0].id;

            const res = await request(app.getHttpServer())
                .get(`/organizations/${targetId}`);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.id).toBe(targetId);
            expect(res.body.name).toBe(allOrgs[0].name);
        });

        it('should return 404 when organization does not exist', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await request(app.getHttpServer())
                .get(`/organizations/${fakeId}`);

            expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});