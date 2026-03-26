// test/user.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DatabaseProvider, DrizzleAsyncProvider } from '../src/drizzle/drizzle.provider';
import { organizations, users } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedUsers } from './seeds/users';
import { sql } from 'drizzle-orm';
import { login, loginAdmin } from './helpers/login';
import { Role } from '../src/auth/roles'

describe('UserController (Integration)', () => {
    let app: INestApplication;
    let drizzle: DatabaseProvider;
    let testOrgId: string;
    let adminToken: string;
    let accountantToken: string;
    let viewerToken: string;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        await drizzle.execute(sql`TRUNCATE TABLE pepol_app.organizations, pepol_app.users CASCADE`);
        await seedOrganizations(app, drizzle);
        const allOrgs = await drizzle.select().from(organizations);
        testOrgId = allOrgs[0].id;
        await seedUsers(app, drizzle, testOrgId);

        accountantToken = await login(app, 'accountant@alpha.com', 'password123');
        adminToken = await loginAdmin(app);
        viewerToken = await login(app, 'boss@beta.com', 'password123');
        // console.log(`[TEST-DEBUG] AccountantToken gegenereerd: ${accountantToken?.substring(0, 20)}...`);
        // console.log(`[TEST-DEBUG] AdminToken gegenereerd: ${adminToken?.substring(0, 20)}...`);
        // console.log(`[TEST-DEBUG] ViewerToken gegenereerd: ${viewerToken?.substring(0, 20)}...`);
    });

    describe('GET /api/users', () => {
        it('should allow ADMIN to fetch all users', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/users')
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.items).toBeDefined();
            expect(res.body.items.length).toBeGreaterThan(0);
        });

        it('should deny VIEWER to fetch all users', async () => {
        const res = await request(app.getHttpServer())
            .get('/api/users')
            .auth(viewerToken, { type: 'bearer' });

        expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
    });
    });

    describe('GET /api/users/me', () => {
    const testCases = [
        { role: 'ACCOUNTANT', token: () => accountantToken, expectedEmail: 'accountant@alpha.com' },
        { role: 'VIEWER', token: () => viewerToken, expectedEmail: 'boss@beta.com' },
        { role: 'ADMIN', token: () => adminToken, expectedEmail: 'admin@test.com' },
    ];

    it.each(testCases)(
        'should allow $role to fetch their own profile', 
        async ({ token, expectedEmail }) => {
            const res = await request(app.getHttpServer())
                .get('/api/users/me')
                .auth(token(), { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.email).toBe(expectedEmail);
        }
    );
});

    describe('GET /api/users/:id', () => {
        it('should allow ADMIN to fetch any user profile', async () => {
            await seedUsers(app, drizzle, testOrgId);
            const allUsers = await drizzle.select().from(users);
            const targetId = allUsers[0].id;

            const res = await request(app.getHttpServer())
                .get(`/api/users/${targetId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.id).toBe(targetId);
        });

        it('should deny user to fetch someone else profile (403)', async () => {
            const allUsers = await drizzle.select().from(users);
            const otherUser = allUsers.find(u => u.email === 'admin@test.com');

            const res = await request(app.getHttpServer())
                .get(`/api/users/${otherUser.id}`) 
                .auth(viewerToken, { type: 'bearer' });
            
            expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
        });
    });

    describe('POST /api/users (Register)', () => {
        it('should register a new user successfully', async () => {
            const registerDto = {
                orgId: testOrgId,
                firstName: 'Sinter',
                lastName: 'Klaas',
                email: 'sint@spanje.es',
                password: 'wachtwoord123',
                role: Role.ACCOUNTANT
            };

            const res = await request(app.getHttpServer())
                .post('/api/users')
                .send(registerDto);

            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.email).toBe(registerDto.email);
            expect(res.body.passwordHash).toBeUndefined(); 
        });

        it('should return 409 when email already exists', async () => {
            await seedUsers(app, drizzle, testOrgId);
            
            const duplicateDto = {
                orgId: testOrgId,
                firstName: 'Duplicate',
                lastName: 'User',
                email: 'accountant@alpha.com', 
                password: 'password123'
            };

            const res = await request(app.getHttpServer())
                .post('/api/users')
                .send(duplicateDto);

            expect(res.statusCode).toBe(HttpStatus.CONFLICT);
        });
    });

    describe('PUT /api/users/me', () => {
        const updateCases = [
            { role: 'ACCOUNTANT', token: () => accountantToken, newName: 'Accountant-Gefixt' },
            { role: 'VIEWER', token: () => viewerToken, newName: 'Viewer-Gefixt' },
            { role: 'ADMIN', token: () => adminToken, newName: 'Admin-Gefixt' },
        ];

        it.each(updateCases)(
            'should allow $role to update their own name', 
            async ({ token, newName }) => {
                const res = await request(app.getHttpServer())
                    .put('/api/users/me') 
                    .auth(token(), { type: 'bearer' })
                    .send({ firstName: newName });

                expect(res.statusCode).toBe(HttpStatus.OK);
                expect(res.body.firstName).toBe(newName);
            }
        );
    });

    afterAll(async () => {
        await app.close();
    });
});