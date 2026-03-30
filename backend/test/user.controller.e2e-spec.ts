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
import { SEED_USERS } from '../src/drizzle/seed-data';

describe('UserController (Integration)', () => {
    let app: INestApplication;
    let drizzle: DatabaseProvider;
    let testOrgId: string;
    let adminToken: string;
    let accountantToken: string;
    let viewerToken: string;
    let adminSeed: any;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        await drizzle.execute(sql`TRUNCATE TABLE pepol_app.organizations, pepol_app.users CASCADE`);
        
        const seededOrgs = await seedOrganizations(drizzle);
        
        const alphaOrgId = seededOrgs[0].id;
        const betaOrgId = seededOrgs[1].id;
        
        testOrgId = alphaOrgId; 

        await seedUsers(app, drizzle, alphaOrgId, betaOrgId);

        const adminData = SEED_USERS.find(u => u.orgSeedKey === 'ALPHA' && u.role === 'ADMIN');
        const viewerData = SEED_USERS.find(u => u.orgSeedKey === 'BETA' && u.role === 'VIEWER');
        const accountantData = SEED_USERS.find(u => u.orgSeedKey === 'ALPHA' && u.role === 'ACCOUNTANT');

        adminToken = await login(app, adminData.email, adminData.password);
        accountantToken = await login(app, accountantData.email, accountantData.password);
        viewerToken = await login(app, viewerData.email, viewerData.password);
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
        { role: 'ACCOUNTANT', token: () => accountantToken, email: 'accountant@alpha.com' },
        { role: 'VIEWER', token: () => viewerToken, email: 'ceo@beta.com' },
        { 
            role: 'ADMIN', 
            token: () => adminToken, 
            email: adminSeed?.email || process.env.ADMIN_EMAIL || 'admin@alpha.com' 
        },
    ];

    it.each(testCases)(
        'should allow $role to fetch their own profile', 
        async ({ token, email }) => {
            const res = await request(app.getHttpServer())
                .get('/api/users/me')
                .auth(token(), { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.email).toBe(email);
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