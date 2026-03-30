// test/seeds/incoming-invoices.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { incomingInvoices, partners, vatCodes } from '../../src/drizzle/schema';
import { SEED_INCOMING_INVOICES } from '../../src/drizzle/seed-data';
import { eq, and } from 'drizzle-orm';

export const seedIncomingInvoices = async (
    drizzle: DatabaseProvider, 
    orgId: string,
    orgSeedKey: string = 'ALPHA'
) => {
    const allVatCodes = await drizzle.select().from(vatCodes);
    
    const rawData = SEED_INCOMING_INVOICES.filter(inv => inv.orgSeedKey === orgSeedKey);

    const invoicesToInsert = [];

    for (const item of rawData) {
        const supplier = await drizzle.select()
            .from(partners)
            .where(
                and(
                    eq(partners.orgId, orgId),
                    eq(partners.name, item.supplierName)
                )
            )
            .limit(1);

        if (supplier.length > 0) {
            const vatCode = allVatCodes.find(v => v.code === item.vatCode);

            invoicesToInsert.push({
                orgId: orgId,
                supplierId: supplier[0].id,
                invoiceNr: item.invoiceNr,
                date: item.date, // "YYYY-MM-DD"
                dueDate: item.dueDate || null,
                totalExclVat: item.totalExclVat.toString(), // Decimal als string
                vatCodeId: vatCode ? vatCode.id : allVatCodes[0].id, // Fallback naar eerste
                status: item.status || 'PENDING',
                isPeppol: item.isPeppol ?? false,
                ocrConfidence: item.ocrConfidence,
            });
        }
    }

    if (invoicesToInsert.length > 0) {
        await drizzle.insert(incomingInvoices)
            .values(invoicesToInsert)
            .onConflictDoNothing();
    }
}

export const clearIncomingInvoices = async (drizzle: DatabaseProvider) => {
    const { sql } = require('drizzle-orm');
    await drizzle.execute(sql`TRUNCATE TABLE pepol_app.incoming_invoices RESTART IDENTITY CASCADE`);
};