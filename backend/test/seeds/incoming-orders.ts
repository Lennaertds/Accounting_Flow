// test/seeds/incoming-orders.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { incomingOrders, partners } from '../../src/drizzle/schema';
import { SEED_INCOMING_ORDERS } from '../../src/drizzle/seed-data';
import { eq, and } from 'drizzle-orm';

export const seedIncomingOrders = async (
    drizzle: DatabaseProvider, 
    orgId: string,
    orgSeedKey: string = 'ALPHA'
) => {
    const rawData = SEED_INCOMING_ORDERS.filter(order => order.orgSeedKey === orgSeedKey);

    for (const item of rawData) {
        const [customer] = await drizzle.select()
            .from(partners)
            .where(
                and(
                    eq(partners.orgId, orgId),
                    eq(partners.name, item.customerName)
                )
            )
            .limit(1);

        if (customer) {
            await drizzle.insert(incomingOrders).values({
                orgId: orgId,
                customerId: customer.id,
                date: item.date, 
                source: item.source, 
                referenceExt: item.referenceExt,
                totalEstimated: item.totalEstimated, 
                status: item.status || 'RECEIVED',
                aiSummary: `Seed data import: ${item.source} order ref ${item.referenceExt}`,
            }).onConflictDoNothing();
        } else {
            console.warn(
                `[SeedWarning] Klant '${item.customerName}' niet gevonden voor org ${orgSeedKey}. ` +
                `Order ${item.referenceExt} overgeslagen.`
            );
        }
    }
}

export const clearIncomingOrders = async (drizzle: DatabaseProvider) => {
    const { sql } = require('drizzle-orm');
    await drizzle.execute(sql`TRUNCATE TABLE pepol_app.incoming_orders RESTART IDENTITY CASCADE`);
};