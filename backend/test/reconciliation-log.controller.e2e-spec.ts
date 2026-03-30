// test/e2e/reconciliation-log.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DrizzleAsyncProvider } from './../src/drizzle/drizzle.provider';
import { organizations, bankStatements, reconciliationLogs } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedBankStatements } from './seeds/bank-statements';
import { seedUsers } from './seeds/users';
import { loginAdmin } from './helpers/login';
import { sql } from 'drizzle-orm';
import { MatchType } from '../src/banking/reconciliation-log.dto';

describe('ReconciliationLogController (Full Integrity)', () => {
    let app: INestApplication;
    let drizzle: any;
    let adminToken: string;
    let testOrgId: string;
    let otherOrgId: string;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        await drizzle.execute(sql`TRUNCATE TABLE pepol_app.organizations, pepol_app.users, pepol_app.bank_statements, pepol_app.reconciliation_logs CASCADE`);
        
        await seedOrganizations(drizzle);
        const allOrgs = await drizzle.select().from(organizations);
        testOrgId = allOrgs[0].id; 
        otherOrgId = allOrgs[1].id;
        
        await seedUsers(app, drizzle, testOrgId);
        adminToken = await loginAdmin(app);

        await seedBankStatements(drizzle, testOrgId, 'ALPHA');
        await seedBankStatements(drizzle, otherOrgId, 'BETA');
    });

    describe('GET /reconciliation-logs', () => {
        it('should return all logs for the current organization', async () => {
            const myStatements = await drizzle.select().from(bankStatements).where(sql`org_id = ${testOrgId}`);
            
            await drizzle.insert(reconciliationLogs).values({
                orgId: testOrgId,
                bankStatementId: myStatements[0].id,
                journalEntryId: myStatements[0].id, 
                transactionId: myStatements[0].id,
                matchType: MatchType.AUTO
            });

            const res = await request(app.getHttpServer())
                .get('/reconciliation-logs')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.length).toBe(1);
            expect(res.body[0].orgId).toBe(testOrgId);
        });
    });

    describe('PUT /reconciliation-logs/:id', () => {
        it('should update the matchType of an existing log', async () => {
            const myStatements = await drizzle.select().from(bankStatements).where(sql`org_id = ${testOrgId}`);
            const [insertedLog] = await drizzle.insert(reconciliationLogs).values({
                orgId: testOrgId,
                bankStatementId: myStatements[0].id,
                journalEntryId: myStatements[0].id,
                transactionId: myStatements[0].id,
                matchType: MatchType.AUTO
            }).returning();

            const updateDto = {
                matchType: MatchType.MANUAL
            };

            const res = await request(app.getHttpServer())
                .put(`/reconciliation-logs/${insertedLog.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateDto);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.matchType).toBe(MatchType.MANUAL);
        });

        it('should return 404 when trying to update a log from another org', async () => {
            const otherStatements = await drizzle.select().from(bankStatements).where(sql`org_id = ${otherOrgId}`);
            const [otherLog] = await drizzle.insert(reconciliationLogs).values({
                orgId: otherOrgId,
                bankStatementId: otherStatements[0].id,
                journalEntryId: otherStatements[0].id,
                transactionId: otherStatements[0].id,
                matchType: MatchType.AUTO
            }).returning();

            const res = await request(app.getHttpServer())
                .put(`/reconciliation-logs/${otherLog.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ matchType: MatchType.MANUAL });

            expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe('DELETE /reconciliation-logs/:id', () => {
        it('should successfully delete a log (un-reconcile)', async () => {
            const myStatements = await drizzle.select().from(bankStatements).where(sql`org_id = ${testOrgId}`);
            const [insertedLog] = await drizzle.insert(reconciliationLogs).values({
                orgId: testOrgId,
                bankStatementId: myStatements[0].id,
                journalEntryId: myStatements[0].id,
                transactionId: myStatements[0].id,
                matchType: MatchType.AUTO
            }).returning();

            const res = await request(app.getHttpServer())
                .delete(`/reconciliation-logs/${insertedLog.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(HttpStatus.OK);

            const check = await drizzle.select().from(reconciliationLogs).where(sql`id = ${insertedLog.id}`);
            expect(check.length).toBe(0);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});