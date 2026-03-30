// test/e2e/outgoing-order.controller.e2e-spec.ts
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DrizzleAsyncProvider } from '../src/drizzle/drizzle.provider';
import { organizations, partners, outgoingOrders } from '../src/drizzle/schema';
import { seedOrganizations } from './seeds/organizations';
import { seedPartners } from './seeds/partners';
import { seedUsers } from './seeds/users';
import { loginAdmin } from './helpers/login';
import { sql, and, eq } from 'drizzle-orm';
import { OrderChannel, OutgoingOrderStatus } from '../src/order/outgoing-order.dto';

describe('OutgoingOrderController (P5 Integrity Test)', () => {
    let app: INestApplication;
    let drizzle: any;
    let adminToken: string;
    let testOrgId: string;
    let testSupplierId: string;

    beforeAll(async () => {
        app = await createApp();
        drizzle = app.get(DrizzleAsyncProvider);
    });

    beforeEach(async () => {
        await drizzle.execute(sql`TRUNCATE TABLE pepol_app.organizations, pepol_app.users, pepol_app.partners, pepol_app.outgoing_orders CASCADE`);
        await seedOrganizations(drizzle);
        const allOrgs = await drizzle.select().from(organizations);
        testOrgId = allOrgs[0].id;
        await seedPartners(drizzle, testOrgId, 'ALPHA');
        const [supplier] = await drizzle.select().from(partners).where(eq(partners.orgId, testOrgId));
        testSupplierId = supplier.id;
        await seedUsers(app, drizzle, testOrgId, 'ALPHA');
        adminToken = await loginAdmin(app);
    });

    describe('POST /outgoing-orders', () => {
        it('should create an outgoing order for a supplier', async () => {
            const createDto = {
                supplierId: testSupplierId,
                orderNr: 'ORD-2026-X1',
                date: '2026-03-29',
                totalEstimated: 250.75,
                channel: OrderChannel.EMAIL,
                status: OutgoingOrderStatus.ORDERED
            };

            const res = await request(app.getHttpServer())
                .post('/outgoing-orders')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(createDto);

            expect(res.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.orderNr).toBe('ORD-2026-X1');
            expect(res.body.totalEstimated).toBe("250.75"); 
            expect(res.body.supplierId).toBe(testSupplierId);
        });

        it('should block duplicate order numbers within the same organization', async () => {
            const baseDto = {
                supplierId: testSupplierId,
                orderNr: 'DUP-ORDER-99',
                date: '2026-03-29',
                totalEstimated: 100,
                channel: OrderChannel.PLATFORM
            };

            await request(app.getHttpServer())
                .post('/outgoing-orders')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(baseDto);

            const res = await request(app.getHttpServer())
                .post('/outgoing-orders')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(baseDto);

            expect(res.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        });
    });

    describe('PATCH /outgoing-orders/:id/status', () => {
        it('should update only the status of an existing order', async () => {
            const [order] = await drizzle.insert(outgoingOrders).values({
                orgId: testOrgId,
                supplierId: testSupplierId,
                orderNr: 'PATCH-TEST-01',
                date: '2026-03-29',
                totalEstimated: '500.00',
                channel: OrderChannel.PEPPOL,
                status: OutgoingOrderStatus.ORDERED
            }).returning();

            const res = await request(app.getHttpServer())
                .patch(`/outgoing-orders/${order.id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: OutgoingOrderStatus.RECEIVED });

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.status).toBe(OutgoingOrderStatus.RECEIVED);
            expect(res.body.orderNr).toBe('PATCH-TEST-01');
        });
    });

    describe('GET /outgoing-orders', () => {
        it('should isolate outgoing orders by organization', async () => {
            await drizzle.insert(outgoingOrders).values({
                orgId: testOrgId,
                supplierId: testSupplierId,
                orderNr: 'MY-ORG-ORD',
                date: '2026-03-29',
                totalEstimated: '10.00',
                channel: OrderChannel.PLATFORM
            });

            const [otherOrg] = await drizzle.insert(organizations).values({ name: 'Foreign Supply' }).returning();
            await drizzle.insert(outgoingOrders).values({
                orgId: otherOrg.id,
                supplierId: sql`gen_random_uuid()`,
                orderNr: 'OTHER-ORG-ORD',
                date: '2026-03-29',
                totalEstimated: '99.00',
                channel: OrderChannel.EMAIL
            });

            const res = await request(app.getHttpServer())
                .get('/outgoing-orders')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(HttpStatus.OK);
            expect(res.body.length).toBe(1);
            expect(res.body[0].orderNr).toBe('MY-ORG-ORD');
        });
    });

    afterAll(async () => {
        await app.close();
    });
});