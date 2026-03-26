// test/seeds/vat-codes.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { vatCodes } from '../../src/drizzle/schema';
import { SEED_VAT_CODES } from '../../src/drizzle/seed-data';

export const seedVatCodes = async (drizzle: DatabaseProvider, orgId: string) => {
    const vatCodesToInsert = SEED_VAT_CODES.map(v => ({
        orgId: orgId,
        code: v.code,
        rate: v.rate.toString(),
        description: v.description,
        taxDeclarationBox: v.taxDeclarationBox,
    }));

    await drizzle.insert(vatCodes)
        .values(vatCodesToInsert).onConflictDoNothing();
}

export const clearVatCodes = async (drizzle: DatabaseProvider) => {
    const { sql } = require('drizzle-orm');
    await drizzle.execute(sql`TRUNCATE TABLE pepol_app.vat_codes RESTART IDENTITY CASCADE`);
};