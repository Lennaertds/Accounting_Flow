// test/e2e/incoming-invoice.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DrizzleAsyncProvider } from '../src/drizzle/drizzle.provider';
import { organizations, partners, vatCodes, incomingInvoices } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedPartners } from './seeds/partners';
import { seedVatCodes } from './seeds/vat-codes';
import { seedUsers } from './seeds/users';
import { loginAdmin } from './helpers/login';
import { sql } from 'drizzle-orm';

describe('IncomingInvoiceController (Integrity Test)', () => {
    let app: INestApplication;
    let drizzle: any;
    let adminToken: string;
    let testOrgId: string;
    let testPartnerId: string;
    let testVatCodeId: string;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        await drizzle.execute(sql`TRUNCATE TABLE pepol_app.organizations, pepol_app.users, pepol_app.partners, pepol_app.vat_codes, pepol_app.incoming_invoices CASCADE`);
        await seedOrganizations(drizzle);
        const allOrgs = await drizzle.select().from(organizations);
        testOrgId = allOrgs[0].id;
        await seedVatCodes(drizzle, testOrgId);
        const allVats = await drizzle.select().from(vatCodes);
        testVatCodeId = allVats[0].id;
        await seedPartners(drizzle, testOrgId, 'ALPHA');
        const allPartners = await drizzle.select().from(partners).where(sql`org_id = ${testOrgId}`);
        testPartnerId = allPartners[0].id;
        await seedUsers(app, drizzle, testOrgId);
        adminToken = await loginAdmin(app);
    });

    describe('POST /incoming-invoices', () => {
        it('should create an invoice and store decimals as strings for precision', async () => {
            const createDto = {
                orgId: testOrgId,
                supplierId: testPartnerId,
                invoiceNr: 'E2E-INV-001',
                date: '2026-03-29',
                totalExclVat: 1500.75, // Als number in DTO
                vatCodeId: testVatCodeId,
                status: 'PENDING',
                ocrConfidence: 98, // Als number in DTO
                isPeppol: true
            };

            const res = await request(app.getHttpServer())
                .post('/incoming-invoices')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createDto);

            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.totalExclVat).toBe("1500.75");
            expect(res.body.ocrConfidence).toBe("98");
            expect(res.body.orgId).toBe(testOrgId);
        });
    });

    describe('GET /incoming-invoices', () => {
        it('should return only invoices belonging to the session organization', async () => {
            await drizzle.insert(incomingInvoices).values({
                orgId: testOrgId,
                supplierId: testPartnerId,
                invoiceNr: 'MY-ORG-INV',
                date: '2026-03-29',
                totalExclVat: '100.00',
                vatCodeId: testVatCodeId,
                status: 'PENDING'
            });

            const [otherOrg] = await drizzle.insert(organizations).values({ name: 'External Corp' }).returning();
            await drizzle.insert(incomingInvoices).values({
                orgId: otherOrg.id,
                supplierId: sql`gen_random_uuid()`,
                invoiceNr: 'OTHER-ORG-INV',
                date: '2026-03-29',
                totalExclVat: '200.00',
                vatCodeId: testVatCodeId,
                status: 'PENDING'
            });

            const res = await request(app.getHttpServer())
                .get('/incoming-invoices')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.length).toBe(1);
            expect(res.body[0].invoiceNr).toBe('MY-ORG-INV');
        });
    });

    describe('PUT /incoming-invoices/:id', () => {
        it('should update the status and keep decimal integrity', async () => {
            const [invoice] = await drizzle.insert(incomingInvoices).values({
                orgId: testOrgId,
                supplierId: testPartnerId,
                invoiceNr: 'UPDATE-ME',
                date: '2026-03-29',
                totalExclVat: '500.00',
                vatCodeId: testVatCodeId,
                status: 'PENDING'
            }).returning();

            const res = await request(app.getHttpServer())
                .put(`/incoming-invoices/${invoice.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'MATCHED', totalExclVat: 550.00 });

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.status).toBe('MATCHED');
            expect(res.body.totalExclVat).toBe('550.00');
        });
    });

    describe('DELETE /incoming-invoices/:id', () => {
        it('should successfully remove the invoice', async () => {
            const [invoice] = await drizzle.insert(incomingInvoices).values({
                orgId: testOrgId,
                supplierId: testPartnerId,
                invoiceNr: 'DELETE-ME',
                date: '2026-03-29',
                totalExclVat: '10.00',
                vatCodeId: testVatCodeId,
                status: 'PENDING'
            }).returning();

            const res = await request(app.getHttpServer())
                .delete(`/incoming-invoices/${invoice.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(HttpStatus.OK);

            const check = await drizzle.select().from(incomingInvoices).where(sql`id = ${invoice.id}`);
            expect(check.length).toBe(0);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});