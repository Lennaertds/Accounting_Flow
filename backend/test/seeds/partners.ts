// test/seeds/partners.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { partners } from '../../src/drizzle/schema';
import { SEED_PARTNERS } from '../../src/drizzle/seed-data';

export const seedPartners = async (drizzle: DatabaseProvider, orgId: string) => {
    const partnersToInsert = SEED_PARTNERS.map(p => ({
        orgId: orgId,
        name: p.name,
        isSupplier: p.isSupplier,
        isCustomer: p.isCustomer,
        preferredOrderChannel: p.preferredOrderChannel,
        preferredInvoiceChannel: p.preferredInvoiceChannel,
    }));

    await drizzle.insert(partners).values(partnersToInsert).onConflictDoNothing();
}

export const clearPartners = async (drizzle: DatabaseProvider) => {
    const { sql } = require('drizzle-orm');
    await drizzle.execute(sql`TRUNCATE TABLE partners RESTART IDENTITY CASCADE`);
};