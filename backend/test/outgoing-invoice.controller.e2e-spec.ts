// test/e2e/outgoing-invoice.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DrizzleAsyncProvider } from '../src/drizzle/drizzle.provider';
import { organizations, partners, vatCodes, outgoingInvoices } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedPartners } from './seeds/partners';
import { seedVatCodes } from './seeds/vat-codes';
import { seedUsers } from './seeds/users';
import { loginAdmin } from './helpers/login';
import { sql, and, eq } from 'drizzle-orm';
import { PeppolStatus } from '../src/invoice/outgoing-invoice.dto';

describe('OutgoingInvoiceController (Integrity Test)', () => {
    let app: INestApplication;
    let drizzle: any;
    let adminToken: string;
    let testOrgId: string;
    let testCustomerId: string;
    let testVatCodeId: string;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        await drizzle.execute(sql`TRUNCATE TABLE pepol_app.organizations, pepol_app.users, pepol_app.partners, pepol_app.vat_codes, pepol_app.outgoing_invoices CASCADE`);
        
        // 1. Setup Basis
        await seedOrganizations(drizzle);        
        const allOrgs = await drizzle.select().from(organizations);
        testOrgId = allOrgs[0].id;
        await seedVatCodes(drizzle, testOrgId);        
        const allVats = await drizzle.select().from(vatCodes);
        testVatCodeId = allVats[0].id;
        await seedPartners(drizzle, testOrgId, 'ALPHA');
        const allPartners = await drizzle.select().from(partners).where(eq(partners.orgId, testOrgId));
        testCustomerId = allPartners[0].id;
        await seedUsers(app, drizzle, testOrgId, 'ALPHA');
        adminToken = await loginAdmin(app);
    });

    describe('POST /outgoing-invoices', () => {
        it('should create an outgoing invoice with decimal-to-string conversion', async () => {
            const createDto = {
                orgId: testOrgId,
                customerId: testCustomerId,
                invoiceNr: '2026-SLS-E2E',
                date: '2026-03-29',
                dueDate: '2026-04-29',
                totalExclVat: 2500.00, 
                vatCodeId: testVatCodeId,
                peppolStatus: PeppolStatus.DRAFT,
                rawFileStoragePath: '/storage/out/fact_e2e.pdf'
            };

            const res = await request(app.getHttpServer())
                .post('/outgoing-invoices')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createDto);

            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.totalExclVat).toBe("2500.00");
            expect(res.body.invoiceNr).toBe('2026-SLS-E2E');
            expect(res.body.orgId).toBe(testOrgId);
        });

        it('should fail when invoice number is duplicated within same organization', async () => {
            const baseDto = {
                orgId: testOrgId,
                customerId: testCustomerId,
                invoiceNr: 'DUP-001',
                date: '2026-03-29',
                totalExclVat: 100,
                vatCodeId: testVatCodeId
            };

            await request(app.getHttpServer())
                .post('/outgoing-invoices')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(baseDto);

            const res = await request(app.getHttpServer())
                .post('/outgoing-invoices')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(baseDto);

            expect(res.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR); 
        });
    });

    describe('GET /outgoing-invoices', () => {
        it('should strictly isolate outgoing invoices by orgId', async () => {
            await drizzle.insert(outgoingInvoices).values({
                orgId: testOrgId,
                customerId: testCustomerId,
                invoiceNr: 'MY-SALES-001',
                date: '2026-03-29',
                totalExclVat: '1000.00',
                vatCodeId: testVatCodeId
            });

            const [otherOrg] = await drizzle.insert(organizations).values({ name: 'Competitor Inc' }).returning();
            await drizzle.insert(outgoingInvoices).values({
                orgId: otherOrg.id,
                customerId: sql`gen_random_uuid()`,
                invoiceNr: 'OTHER-SALES-999',
                date: '2026-03-29',
                totalExclVat: '5000.00',
                vatCodeId: testVatCodeId
            });

            const res = await request(app.getHttpServer())
                .get('/outgoing-invoices')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.length).toBe(1);
            expect(res.body[0].invoiceNr).toBe('MY-SALES-001');
        });
    });

    describe('PUT /outgoing-invoices/:id', () => {
        it('should update peppolStatus and dueDate', async () => {
            const [invoice] = await drizzle.insert(outgoingInvoices).values({
                orgId: testOrgId,
                customerId: testCustomerId,
                invoiceNr: 'UPD-001',
                date: '2026-03-29',
                totalExclVat: '100.00',
                vatCodeId: testVatCodeId,
                peppolStatus: PeppolStatus.DRAFT
            }).returning();

            const res = await request(app.getHttpServer())
                .put(`/outgoing-invoices/${invoice.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ peppolStatus: PeppolStatus.SENT, dueDate: '2026-05-01' });

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.peppolStatus).toBe(PeppolStatus.SENT);
            expect(res.body.dueDate).toBe('2026-05-01');
        });
    });

    afterAll(async () => {
        await app.close();
    });
});