// test/user.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DatabaseProvider, DrizzleAsyncProvider } from '../src/drizzle/drizzle.provider';
import { organizations, users } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedUsers } from './seeds/users';
import { sql } from 'drizzle-orm';

describe('UserController (Integration)', () => {
    let app: INestApplication;
    let drizzle: DatabaseProvider;
    let testOrgId: string;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        await drizzle.execute(sql`TRUNCATE TABLE organizations, users CASCADE`);
        const orgs = await seedOrganizations(drizzle);
        const allOrgs = await drizzle.select().from(organizations);
        testOrgId = allOrgs[0].id;
    });

    describe('POST /users (Register)', () => {
        it('should register a new user successfully', async () => {
            const registerDto = {
                orgId: testOrgId,
                firstName: 'Sinter',
                lastName: 'Klaas',
                email: 'sint@spanje.es',
                password: 'wachtwoord123',
                role: 'ADMIN'
            };

            const res = await request(app.getHttpServer())
                .post('/users')
                .send(registerDto);

            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.email).toBe(registerDto.email);
            expect(res.body.passwordHash).toBeUndefined(); 
        });

        it('should return 409 when email already exists', async () => {
            await seedUsers(drizzle, testOrgId);
            
            const duplicateDto = {
                orgId: testOrgId,
                firstName: 'Piet',
                lastName: 'Piraat',
                email: 'test@example.com', 
                password: 'password123'
            };

            const res = await request(app.getHttpServer())
                .post('/users')
                .send(duplicateDto);

            expect(res.statusCode).toBe(HttpStatus.CONFLICT);
        });
    });

    describe('GET /users', () => {
        it('should return all users (Admin only)', async () => {
            await seedUsers(drizzle, testOrgId);

            const res = await request(app.getHttpServer())
                .get('/users');

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.items).toBeDefined();
            expect(res.body.items.length).toBeGreaterThan(0);
        });
    });

    describe('GET /users/:id', () => {
        it('should return a specific user', async () => {
            await seedUsers(drizzle, testOrgId);
            const allUsers = await drizzle.select().from(users);
            const targetId = allUsers[0].id;

            const res = await request(app.getHttpServer())
                .get(`/users/${targetId}`);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.id).toBe(targetId);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});