// test/e2e/match-p2-p4.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DrizzleAsyncProvider } from '../src/drizzle/drizzle.provider';
import { organizations, incomingOrders, outgoingInvoices, matchP2P4 } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedPartners } from './seeds/partners';
import { seedUsers } from './seeds/users';
import { loginAdmin } from './helpers/login';
import { sql, eq } from 'drizzle-orm';

describe('MatchP2P4Controller (Matching Integrity Test)', () => {
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
        // Cleanup alle gerelateerde tabellen
        await drizzle.execute(sql`TRUNCATE TABLE pepol_app.organizations, pepol_app.partners, pepol_app.incoming_orders, pepol_app.outgoing_invoices, pepol_app.match_p2_p4 CASCADE`);
        
        // 1. Setup Basis (Org & User)
        await seedOrganizations(drizzle);
        const allOrgs = await drizzle.select().from(organizations);
        testOrgId = allOrgs[0].id;
        await seedUsers(app, drizzle, testOrgId, 'ALPHA');
        adminToken = await loginAdmin(app);

        // 2. Setup Partner (Klant)
        await seedPartners(drizzle, testOrgId, 'ALPHA');
        const [customer] = await drizzle.select().from(sql`pepol_app.partners`).limit(1);

        // 3. Maak een Inkomende Order (P2)
        const [order] = await drizzle.insert(incomingOrders).values({
            orgId: testOrgId,
            customerId: customer.id,
            date: '2026-03-29',
            source: 'PEPPOL',
            referenceExt: 'REF-ORDER-123',
            totalEstimated: '1000.00',
            status: 'RECEIVED'
        }).returning();
        testOrderId = order.id;

        // 4. Maak een Uitgaande Factuur (P4)
        const [invoice] = await drizzle.insert(outgoingInvoices).values({
            orgId: testOrgId,
            partnerId: customer.id,
            invoiceNr: 'INV-2026-001',
            date: '2026-03-29',
            dueDate: '2026-04-29',
            totalAmount: '1000.00',
            peppolStatus: 'DRAFT' // Start als Draft
        }).returning();
        testInvoiceId = invoice.id;
    });

    describe('POST /match-p2-p4', () => {
        it('should match an order to an invoice and update invoice status to SENT', async () => {
            const matchDto = {
                incomingOrderId: testOrderId,
                outgoingInvoiceId: testInvoiceId,
                matchConfidence: 0.99
            };

            const res = await request(app.getHttpServer())
                .post('/match-p2-p4')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(matchDto);

            // Check match response
            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.incomingOrderId).toBe(testOrderId);
            expect(res.body.matchConfidence).toBe("0.99");

            // Check of de transactie de factuurstatus heeft aangepast
            const [updatedInvoice] = await drizzle.select()
                .from(outgoingInvoices)
                .where(eq(outgoingInvoices.id, testInvoiceId));
            
            expect(updatedInvoice.peppolStatus).toBe('SENT');
        });

        it('should block matching entities from a different organization', async () => {
            // Maak een tweede organisatie
            const [otherOrg] = await drizzle.insert(organizations).values({ name: 'Hacker Corp' }).returning();
            
            // Probeer de legitieme order te matchen aan een "illegale" factuur van de andere org
            const [illegalInvoice] = await drizzle.insert(outgoingInvoices).values({
                orgId: otherOrg.id,
                partnerId: sql`gen_random_uuid()`,
                invoiceNr: 'HACK-001',
                date: '2026-03-29',
                dueDate: '2026-04-29',
                totalAmount: '5.00',
                peppolStatus: 'DRAFT'
            }).returning();

            const res = await request(app.getHttpServer())
                .post('/match-p2-p4')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    incomingOrderId: testOrderId,
                    outgoingInvoiceId: illegalInvoice.id
                });

            // Moet falen op de orgId check in de service
            expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe('GET /match-p2-p4/invoice/:id', () => {
        it('should retrieve matches for a specific invoice', async () => {
            // Handmatig een match invoegen
            await drizzle.insert(matchP2P4).values({
                orgId: testOrgId,
                incomingOrderId: testOrderId,
                outgoingInvoiceId: testInvoiceId,
                matchConfidence: '1.00'
            });

            const res = await request(app.getHttpServer())
                .get(`/match-p2-p4/invoice/${testInvoiceId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.length).toBe(1);
            expect(res.body[0].incomingOrderId).toBe(testOrderId);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});