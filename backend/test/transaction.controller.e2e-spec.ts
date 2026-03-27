// backend/test/transaction.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DrizzleAsyncProvider } from '../src/drizzle/drizzle.provider';
import { organizations, journalEntries, ledgerAccounts, transactions } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedUsers } from './seeds/users';
import { seedJournals } from './seeds/journals';
import { seedJournalEntries } from './seeds/journal-entries';
import { seedLedgerAccounts } from './seeds/ledger-accounts';
import { seedTransactions } from './seeds/transactions';
import { loginAdmin } from './helpers/login';
import { sql, eq } from 'drizzle-orm';

describe('TransactionController (Integration)', () => {
    let app: INestApplication;
    let drizzle: any;
    let adminToken: string;
    let testOrgId: string;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        await drizzle.execute(sql`
        TRUNCATE TABLE 
            pepol_app.transactions, 
            pepol_app.journal_entries, 
            pepol_app.journals, 
            pepol_app.ledger_accounts, 
            pepol_app.users, 
            pepol_app.organizations 
        CASCADE`);
        await seedOrganizations(drizzle);
        const allOrgs = await drizzle.select().from(organizations);
        testOrgId = allOrgs[0].id; 
        await seedUsers(app, drizzle, testOrgId);
        adminToken = await loginAdmin(app);
        await seedLedgerAccounts(drizzle, testOrgId);
        await seedJournals(drizzle, testOrgId);
        await seedJournalEntries(drizzle, testOrgId);
        await seedTransactions(drizzle, testOrgId);
    });

    describe('GET /api/transactions', () => {
        it('should return transactions for a specific journal entry', async () => {
            const entries = await drizzle.select()
                .from(journalEntries)
                .where(eq(journalEntries.description, 'Kantoorbenodigdheden ACME'));
            
            const entry = entries[0];
            
            const res = await request(app.getHttpServer())
                .get(`/api/transactions?journalEntryId=${entry.id}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0].entryId).toBe(entry.id);
        });
    });

    describe('POST /api/transactions', () => {
        it('should add a new line to an existing journal entry', async () => {
            const entry = (await drizzle.select().from(journalEntries).limit(1))[0];
            const ledger = (await drizzle.select().from(ledgerAccounts).limit(1))[0];

            const createDto = {
                orgId: testOrgId,
                entryId: entry.id,
                ledgerId: ledger.id,
                amount: 500.50,
                isReconciled: false
            };

            const res = await request(app.getHttpServer())
                .post('/api/transactions')
                .auth(adminToken, { type: 'bearer' })
                .send(createDto);

            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.amount).toBe("500.50"); 
            expect(res.body.entryId).toBe(entry.id);
        });
    });

    describe('PUT /api/transactions/:id', () => {
        it('should update the amount of a transaction', async () => {
            const allTx = await drizzle.select().from(transactions).where(eq(transactions.orgId, testOrgId));
            const target = allTx[0];

            const updateDto = {
                amount: 999.99
            };

            const res = await request(app.getHttpServer())
                .put(`/api/transactions/${target.id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(updateDto);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.amount).toBe("999.99");
        });

        it('should ignore attempts to change orgId or entryId', async () => {
            const allTx = await drizzle.select().from(transactions).where(eq(transactions.orgId, testOrgId));
            const target = allTx[0];
            const fakeUuid = '00000000-0000-0000-0000-000000000000';

            const updateDto = {
                orgId: fakeUuid,
                entryId: fakeUuid,
                amount: 123.45
            };

            const res = await request(app.getHttpServer())
                .put(`/api/transactions/${target.id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(updateDto);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.orgId).toBe(testOrgId); 
            expect(res.body.entryId).toBe(target.entryId); 
        });
    });

    describe('DELETE /api/transactions/:id', () => {
        it('should delete a transaction line', async () => {
            const allTx = await drizzle.select().from(transactions).where(eq(transactions.orgId, testOrgId));
            const targetId = allTx[0].id;

            const res = await request(app.getHttpServer())
                .delete(`/api/transactions/${targetId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.statusCode).toBe(HttpStatus.OK);

            const check = await drizzle.select().from(transactions).where(eq(transactions.id, targetId));
            expect(check.length).toBe(0);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});