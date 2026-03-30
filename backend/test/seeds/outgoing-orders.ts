// test/seeds/outgoing-orders.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { outgoingOrders, partners } from '../../src/drizzle/schema';
import { SEED_OUTGOING_ORDERS } from '../../src/drizzle/seed-data';
import { eq, and } from 'drizzle-orm';

export const seedOutgoingOrders = async (drizzle: DatabaseProvider, orgId: string, orgSeedKey: string = 'ALPHA') => {
    const rawData = SEED_OUTGOING_ORDERS.filter(o => o.orgSeedKey === orgSeedKey);

    for (const item of rawData) {
        const [supplier] = await drizzle.select()
            .from(partners)
            .where(and(eq(partners.orgId, orgId), eq(partners.name, item.supplierName)))
            .limit(1);

        if (supplier) {
            await drizzle.insert(outgoingOrders).values({
                orgId: orgId,
                supplierId: supplier.id,
                orderNr: item.orderNr,
                date: item.date,
                totalEstimated: item.totalEstimated,
                channel: item.channel,
                status: item.status || 'ORDERED',
            }).onConflictDoNothing();
        }
    }
}

export const clearOutgoingOrders = async (drizzle: DatabaseProvider) => {
    const { sql } = require('drizzle-orm');
    await drizzle.execute(sql`TRUNCATE TABLE pepol_app.outgoing_orders RESTART IDENTITY CASCADE`);
};