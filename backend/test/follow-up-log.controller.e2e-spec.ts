// test/e2e/follow-up-log.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DrizzleAsyncProvider } from './../src/drizzle/drizzle.provider';
import { organizations, users, followUpLogs, matchP5P1 } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedUsers } from './seeds/users';
import { seedFollowUpLogs } from './seeds/follow-up-logs';
import { loginAdmin } from './helpers/login';
import { sql } from 'drizzle-orm';

describe('FollowUpLogController (Integrity Test)', () => {
    let app: INestApplication;
    let drizzle: any;
    let adminToken: string;
    let testOrgId: string;
    let testUserId: string;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        await drizzle.execute(sql`TRUNCATE TABLE pepol_app.organizations, pepol_app.users, pepol_app.follow_up_logs, pepol_app.match_p5_p1 CASCADE`);
        
        await seedOrganizations(drizzle);
        const allOrgs = await drizzle.select().from(organizations);
        testOrgId = allOrgs[0].id; 
        
        await seedUsers(app, drizzle, testOrgId);
        const allUsers = await drizzle.select().from(users).where(sql`org_id = ${testOrgId}`);
        testUserId = allUsers[0].id;
        adminToken = await loginAdmin(app);
    });

    describe('POST /follow-up-logs', () => {
        it('should create a log with real references', async () => {
            const createDto = {
                orgId: testOrgId,
                userId: testUserId,
                actionTaken: 'Handmatige controle uitgevoerd op factuurverschil',
                statusAfterAction: 'UNDER_REVIEW'
            };

            const res = await request(app.getHttpServer())
                .post('/follow-up-logs')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createDto);

            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.userId).toBe(testUserId);
            expect(res.body.actionTaken).toContain('Handmatige controle');
        });
    });

    describe('GET /follow-up-logs/match/:type/:id', () => {
        it('should return logs for a real P5P1 match', async () => {
            const [match] = await drizzle.insert(matchP5P1).values({
                orgId: testOrgId,
                outgoingOrderId: sql`gen_random_uuid()`, 
                incomingInvoiceId: sql`gen_random_uuid()`,
            }).returning();

            await drizzle.insert(followUpLogs).values({
                orgId: testOrgId,
                userId: testUserId,
                matchP5P1Id: match.id,
                actionTaken: 'Gekoppeld aan match',
                statusAfterAction: 'MATCHED'
            });

            const res = await request(app.getHttpServer())
                .get(`/follow-up-logs/match/P5P1/${match.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.length).toBe(1);
            expect(res.body[0].matchP5P1Id).toBe(match.id);
        });
    });

    describe('DELETE /follow-up-logs/:id', () => {
        it('should delete a log and verify it is gone from DB', async () => {
            await seedFollowUpLogs(drizzle, testOrgId, 'ALPHA');
            const logs = await drizzle.select().from(followUpLogs);
            const targetId = logs[0].id;

            const res = await request(app.getHttpServer())
                .delete(`/follow-up-logs/${targetId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(HttpStatus.OK);

            const check = await drizzle.select().from(followUpLogs).where(sql`id = ${targetId}`);
            expect(check.length).toBe(0);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});