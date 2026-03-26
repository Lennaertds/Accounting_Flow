// test/e2e/journal.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DrizzleAsyncProvider } from '../src/drizzle/drizzle.provider';
import { organizations, journals } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedJournals } from './seeds/journals';
import { seedUsers } from './seeds/users';
import { loginAdmin } from './helpers/login';
import { sql, and, eq, not } from 'drizzle-orm';
import { JournalType } from '../src/accounting/journal.dto';

describe('JournalController (Integration)', () => {
    let app: INestApplication;
    let drizzle: any;
    let adminToken: string;
    let testOrgId: string;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        await drizzle.execute(sql`TRUNCATE TABLE pepol_app.organizations, pepol_app.users, pepol_app.journals CASCADE`);
        await seedOrganizations(drizzle);
        const allOrgs = await drizzle.select().from(organizations);
        testOrgId = allOrgs[0].id; 
        await seedUsers(app, drizzle, testOrgId);
        adminToken = await loginAdmin(app);
        await seedJournals(drizzle, testOrgId);
    });

    describe('POST /journals', () => {
        it('should create a new journal for the authenticated organization', async () => {
            const createDto = {
                orgId: testOrgId,
                name: 'Extra Bank Account',
                code: 'BNK2',
                type: JournalType.BANK,
            };

            const res = await request(app.getHttpServer())
                .post('/journals')
                .auth(adminToken, { type: 'bearer' })
                .send(createDto);

            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.code).toBe('BNK2');
            expect(res.body.orgId).toBe(testOrgId);
        });

        it('should return 409 Conflict when the journal code already exists in the org', async () => {
            const duplicateDto = {
                orgId: testOrgId,
                name: 'Duplicate Purchase Journal',
                code: 'PUR', 
                type: JournalType.PURCHASE,
            };

            const res = await request(app.getHttpServer())
                .post('/journals')
                .auth(adminToken, { type: 'bearer' })
                .send(duplicateDto);

            expect(res.statusCode).toBe(HttpStatus.CONFLICT);
            expect(res.body.message).toContain('is al in gebruik');
        });
    });

    describe('GET /journals', () => {
        it('should only return journals belonging to the users organization', async () => {
            const allOrgs = await drizzle.select().from(organizations);
            const otherOrgId = allOrgs[1].id;
            await seedJournals(drizzle, otherOrgId);

            const res = await request(app.getHttpServer())
                .get('/journals')
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);
            const allBelongToOrg = res.body.every((j: any) => j.orgId === testOrgId);
            expect(allBelongToOrg).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('GET /journals/:id', () => {
        it('should return 404 when trying to access a journal of another organization', async () => {
            const allOrgs = await drizzle.select().from(organizations);
            const otherOrgId = allOrgs[1].id;
            await seedJournals(drizzle, otherOrgId);
            
            const otherJournals = await drizzle.select().from(journals).where(eq(journals.orgId, otherOrgId));
            const targetId = otherJournals[0].id;

            const res = await request(app.getHttpServer())
                .get(`/journals/${targetId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe('PUT /journals/:id', () => {
        it('should update the name but ignore changes to code or orgId', async () => {
            const allJournals = await drizzle.select().from(journals).where(eq(journals.orgId, testOrgId));
            const target = allJournals[0];

            const updateDto = {
                name: 'Updated Journal Name',
                code: 'HACK',
                orgId: 'some-other-uuid' 
            };

            const res = await request(app.getHttpServer())
                .put(`/journals/${target.id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(updateDto);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.name).toBe('Updated Journal Name');
            expect(res.body.code).toBe(target.code); 
            expect(res.body.orgId).toBe(testOrgId);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});