// test/e2e/journal-entry.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DrizzleAsyncProvider } from '../src/drizzle/drizzle.provider';
import { organizations, journals, journalEntries } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedJournals } from './seeds/journals';
import { seedJournalEntries } from './seeds/journal-entries';
import { seedUsers } from './seeds/users';
import { loginAdmin } from './helpers/login';
import { sql, eq } from 'drizzle-orm';
import { SEED_USERS } from '../src/drizzle/seed-data';

describe('JournalEntryController (Integration)', () => {
    let app: INestApplication;
    let drizzle: any;
    let adminToken: string;
    let testOrgId: string;
    let testJournalId: string;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        await drizzle.execute(sql`TRUNCATE TABLE pepol_app.organizations, pepol_app.users, pepol_app.journals, pepol_app.journal_entries CASCADE`);
        await seedOrganizations(drizzle);
        const allOrgs = await drizzle.select().from(organizations);
        testOrgId = allOrgs[0].id; 
        await seedUsers(app, drizzle, testOrgId);
        adminToken = await loginAdmin(app);
        await seedJournals(drizzle, testOrgId);
        const orgJournals = await drizzle.select().from(journals).where(eq(journals.orgId, testOrgId));
        testJournalId = orgJournals[0].id;
        await seedJournalEntries(drizzle, testOrgId);
    });

    describe('POST /api/journal-entries', () => {
        it('should create a journal entry linked to the correct journal and org', async () => {
            const createDto = {
                orgId: testOrgId,
                journalId: testJournalId,
                date: '2026-04-01',
                description: 'Test Boeking via API',
            };

            const res = await request(app.getHttpServer())
                .post('/api/journal-entries')
                .auth(adminToken, { type: 'bearer' })
                .send(createDto);

            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.orgId).toBe(testOrgId);
            expect(res.body.journalId).toBe(testJournalId);
            expect(res.body.description).toBe('Test Boeking via API');
        });
    });

    describe('GET /api/journal-entries', () => {
        it('should return entries for the users organization, filtered by journalId', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/journal-entries')
                .query({ journalId: testJournalId })
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body.every((e: any) => e.journalId === testJournalId)).toBe(true);
            expect(res.body.every((e: any) => e.orgId === testOrgId)).toBe(true);
        });
    });

    describe('GET /api/journal-entries/:id', () => {
        it('should return 404 when entry belongs to another organization', async () => {
            const allOrgs = await drizzle.select().from(organizations);
            const otherOrgId = allOrgs[1].id;
            await seedJournals(drizzle, otherOrgId);
            await seedJournalEntries(drizzle, otherOrgId);
            
            const otherEntries = await drizzle.select().from(journalEntries).where(eq(journalEntries.orgId, otherOrgId));
            const targetId = otherEntries[0].id;

            const res = await request(app.getHttpServer())
                .get(`/api/journal-entries/${targetId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe('PUT /api/journal-entries/:id', () => {
        it('should update description but not orgId or journalId', async () => {
            const allEntries = await drizzle.select().from(journalEntries).where(eq(journalEntries.orgId, testOrgId));
            const target = allEntries[0];

            const updateDto = {
                description: 'Geüpdatete omschrijving',
                date: typeof target.date === 'string' ? target.date : new Date(target.date).toISOString().split('T')[0],
                orgId: testOrgId,
                journalId: target.journalId
            };

            const res = await request(app.getHttpServer())
                .put(`/api/journal-entries/${target.id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(updateDto);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.description).toBe('Geüpdatete omschrijving');
            expect(res.body.orgId).toBe(testOrgId); 
        });
    });

    describe('DELETE /api/journal-entries/:id', () => {
        it('should delete an entry belonging to the same org', async () => {
            const allEntries = await drizzle.select().from(journalEntries).where(eq(journalEntries.orgId, testOrgId));
            const targetId = allEntries[0].id;

            const res = await request(app.getHttpServer())
                .delete(`/api/journal-entries/${targetId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);
            
            const check = await drizzle.select().from(journalEntries).where(eq(journalEntries.id, targetId));
            expect(check.length).toBe(0);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});