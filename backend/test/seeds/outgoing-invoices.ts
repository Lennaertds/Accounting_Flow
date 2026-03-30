// test/seeds/outgoing-invoices.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { outgoingInvoices, partners, vatCodes } from '../../src/drizzle/schema';
import { SEED_OUTGOING_INVOICES } from '../../src/drizzle/seed-data';
import { eq, and } from 'drizzle-orm';

export const seedOutgoingInvoices = async (
    drizzle: DatabaseProvider, 
    orgId: string,
    orgSeedKey: string = 'ALPHA'
) => {
    const allVatCodes = await drizzle.select().from(vatCodes);
    const rawData = SEED_OUTGOING_INVOICES.filter(inv => inv.orgSeedKey === orgSeedKey);

    for (const item of rawData) {
        const [customer] = await drizzle.select()
            .from(partners)
            .where(and(eq(partners.orgId, orgId), eq(partners.name, item.customerName)))
            .limit(1);

        if (customer) {
            const vatCode = allVatCodes.find(v => v.code === item.vatCode) || allVatCodes[0];

            await drizzle.insert(outgoingInvoices).values({
                orgId: orgId,
                customerId: customer.id,
                invoiceNr: item.invoiceNr,
                date: item.date,
                dueDate: item.dueDate || null,
                totalExclVat: item.totalExclVat, 
                vatCodeId: vatCode.id,
                peppolStatus: item.peppolStatus,
                rawFileStoragePath: item.rawFileStoragePath || null,
            }).onConflictDoNothing();
        }
    }
}

export const clearOutgoingInvoices = async (drizzle: DatabaseProvider) => {
    const { sql } = require('drizzle-orm');
    await drizzle.execute(sql`TRUNCATE TABLE pepol_app.outgoing_invoices RESTART IDENTITY CASCADE`);
};