// test/e2e/match-p5-p1.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DrizzleAsyncProvider } from '../src/drizzle/drizzle.provider';
import { organizations, partners, outgoingOrders, incomingInvoices, matchP5P1 } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedPartners } from './seeds/partners';
import { seedUsers } from './seeds/users';
import { loginAdmin } from './helpers/login';
import { sql, eq } from 'drizzle-orm';

describe('MatchP5P1Controller (Inkoop Matching Integrity)', () => {
    let app: INestApplication;
    let drizzle: any;
    let adminToken: string;
    let testOrgId: string;
    let testOrderId: string;
    let testInvoiceId: string;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        // Cleanup alle gerelateerde tabellen voor Pilaar 5 & 1
        await drizzle.execute(sql`TRUNCATE TABLE pepol_app.organizations, pepol_app.partners, pepol_app.outgoing_orders, pepol_app.incoming_invoices, pepol_app.match_p5_p1 CASCADE`);
        
        // 1. Setup Basis (Org & User)
        await seedOrganizations(drizzle);
        const allOrgs = await drizzle.select().from(organizations);
        testOrgId = allOrgs[0].id;
        await seedUsers(app, drizzle, testOrgId, 'ALPHA');
        adminToken = await loginAdmin(app);

        // 2. Setup Partner (Leverancier)
        await seedPartners(drizzle, testOrgId, 'ALPHA');
        const [supplier] = await drizzle.select().from(partners).where(eq(partners.orgId, testOrgId)).limit(1);

        // 3. Maak een Uitgaande Order (P5) - De bestelling bij Dell/Kantoorshop
        const [order] = await drizzle.insert(outgoingOrders).values({
            orgId: testOrgId,
            supplierId: supplier.id,
            orderNr: 'PO-2026-999',
            date: '2026-03-01',
            totalEstimated: '500.00',
            channel: 'PEPPOL',
            status: 'ORDERED'
        }).returning();
        testOrderId = order.id;

        // 4. Maak een Inkomende Factuur (P1) - De rekening die je ontvangt
        const [invoice] = await drizzle.insert(incomingInvoices).values({
            orgId: testOrgId,
            partnerId: supplier.id,
            invoiceNr: 'FACT-SUPPLIER-001',
            date: '2026-03-15',
            dueDate: '2026-04-15',
            totalAmount: '500.00',
            status: 'PENDING' // Factuur wacht op goedkeuring/match
        }).returning();
        testInvoiceId = invoice.id;
    });

    describe('POST /match-p5-p1', () => {
        it('should successfully match a purchase order to an incoming invoice', async () => {
            const matchDto = {
                outgoingOrderId: testOrderId,
                incomingInvoiceId: testInvoiceId
            };

            const res = await request(app.getHttpServer())
                .post('/match-p5-p1')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(matchDto);

            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.outgoingOrderId).toBe(testOrderId);
            expect(res.body.incomingInvoiceId).toBe(testInvoiceId);

            // Verifieer database record
            const [dbMatch] = await drizzle.select().from(matchP5P1).where(eq(matchP5P1.id, res.body.id));
            expect(dbMatch).toBeDefined();
        });

        it('should fail when attempting to match an invoice from a different organization', async () => {
            // Maak een tweede malafide organisatie
            const [hackerOrg] = await drizzle.insert(organizations).values({ name: 'Shadow Corp' }).returning();
            
            // Factuur van de hacker org
            const [illegalInvoice] = await drizzle.insert(incomingInvoices).values({
                orgId: hackerOrg.id,
                partnerId: sql`gen_random_uuid()`,
                invoiceNr: 'STEAL-001',
                date: '2026-03-29',
                dueDate: '2026-04-29',
                totalAmount: '9999.00',
                status: 'PENDING'
            }).returning();

            const res = await request(app.getHttpServer())
                .post('/match-p5-p1')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    outgoingOrderId: testOrderId,
                    incomingInvoiceId: illegalInvoice.id
                });

            // Service moet NotFound gooien omdat de factuur niet bij de admin's orgId hoort
            expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe('GET /match-p5-p1/order/:id', () => {
        it('should return all invoices linked to a specific order', async () => {
            // Eerst een match aanmaken
            await drizzle.insert(matchP5P1).values({
                orgId: testOrgId,
                outgoingOrderId: testOrderId,
                incomingInvoiceId: testInvoiceId
            });

            const res = await request(app.getHttpServer())
                .get(`/match-p5-p1/order/${testOrderId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.length).toBe(1);
            expect(res.body[0].incomingInvoiceId).toBe(testInvoiceId);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});