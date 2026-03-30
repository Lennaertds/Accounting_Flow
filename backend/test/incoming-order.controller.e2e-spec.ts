// test/e2e/incoming-order.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DrizzleAsyncProvider } from '../src/drizzle/drizzle.provider';
import { organizations, partners, incomingOrders } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedPartners } from './seeds/partners';
import { seedUsers } from './seeds/users';
import { loginAdmin } from './helpers/login';
import { sql, and, eq } from 'drizzle-orm';
import { OrderSource, IncomingOrderStatus } from '../src/order/incoming-order.dto';

describe('IncomingOrderController (P2 Integrity Test)', () => {
    let app: INestApplication;
    let drizzle: any;
    let adminToken: string;
    let testOrgId: string;
    let testCustomerId: string;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        // Volledige cleanup van de keten voor Pilaar 2
        await drizzle.execute(sql`TRUNCATE TABLE pepol_app.organizations, pepol_app.users, pepol_app.partners, pepol_app.incoming_orders CASCADE`);
        
        // 1. Setup Organisatie
        await seedOrganizations(drizzle);
        const allOrgs = await drizzle.select().from(organizations);
        testOrgId = allOrgs[0].id;

        // 2. Setup Klant (Partner) via ALPHA scenario
        await seedPartners(drizzle, testOrgId, 'ALPHA');
        const [customer] = await drizzle.select().from(partners).where(eq(partners.orgId, testOrgId));
        testCustomerId = customer.id;

        // 3. Login
        await seedUsers(app, drizzle, testOrgId, 'ALPHA');
        adminToken = await loginAdmin(app);
    });

    describe('POST /incoming-orders', () => {
        it('should create an incoming order from an AI source', async () => {
            const createDto = {
                customerId: testCustomerId,
                date: '2026-03-29',
                source: OrderSource.EMAIL_AI,
                referenceExt: 'MAIL-E2E-123',
                totalEstimated: 1250.50,
                aiSummary: 'Gevonden in e-mail van klant X'
            };

            const res = await request(app.getHttpServer())
                .post('/incoming-orders')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createDto);

            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.source).toBe(OrderSource.EMAIL_AI);
            expect(res.body.totalEstimated).toBe("1250.50"); // String in DB
            expect(res.body.status).toBe(IncomingOrderStatus.RECEIVED); // Default
        });

        it('should fail when referenceExt is duplicated for the same customer', async () => {
            const baseDto = {
                customerId: testCustomerId,
                date: '2026-03-29',
                source: OrderSource.PEPPOL,
                referenceExt: 'UNIQUE-REF-001',
                totalEstimated: 500
            };

            // Eerste keer succes
            await request(app.getHttpServer())
                .post('/incoming-orders')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(baseDto);

            // Tweede keer moet falen op de Unique Constraint (customerId + referenceExt)
            const res = await request(app.getHttpServer())
                .post('/incoming-orders')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(baseDto);

            expect(res.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        });
    });

    describe('GET /incoming-orders', () => {
        it('should only return incoming orders for the logged-in organization', async () => {
            // 1. Eigen order
            await drizzle.insert(incomingOrders).values({
                orgId: testOrgId,
                customerId: testCustomerId,
                date: '2026-03-29',
                source: OrderSource.PLATFORM,
                referenceExt: 'MY-ORG-ORDER',
                totalEstimated: '100.00'
            });

            // 2. Order van een andere organisatie
            const [otherOrg] = await drizzle.insert(organizations).values({ name: 'Other Corp' }).returning();
            await drizzle.insert(incomingOrders).values({
                orgId: otherOrg.id,
                customerId: sql`gen_random_uuid()`, // Dummy UUID
                date: '2026-03-29',
                source: OrderSource.PEPPOL,
                referenceExt: 'OTHER-ORG-ORDER',
                totalEstimated: '999.00'
            });

            const res = await request(app.getHttpServer())
                .get('/incoming-orders')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.length).toBe(1);
            expect(res.body[0].referenceExt).toBe('MY-ORG-ORDER');
        });
    });

    describe('PUT /incoming-orders/:id', () => {
        it('should update the status to CONFIRMED', async () => {
            const [order] = await drizzle.insert(incomingOrders).values({
                orgId: testOrgId,
                customerId: testCustomerId,
                date: '2026-03-29',
                source: OrderSource.PEPPOL,
                referenceExt: 'UPDATE-ME',
                totalEstimated: '50.00',
                status: IncomingOrderStatus.RECEIVED
            }).returning();

            const res = await request(app.getHttpServer())
                .put(`/incoming-orders/${order.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: IncomingOrderStatus.CONFIRMED });

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.status).toBe(IncomingOrderStatus.CONFIRMED);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});