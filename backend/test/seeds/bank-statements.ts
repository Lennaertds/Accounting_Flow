// test/seeds/bank-statements.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { bankStatements } from '../../src/drizzle/schema';
import { SEED_BANK_STATEMENTS } from '../../src/drizzle/seed-data';

export const seedBankStatements = async (
    drizzle: DatabaseProvider, 
    orgId: string, 
    orgSeedKey: string = 'ALPHA'
) => {
    const statementsToInsert = SEED_BANK_STATEMENTS
        .filter(s => s.orgSeedKey === orgSeedKey)
        .map(s => ({
            orgId: orgId,
            date: s.date,
            amount: s.amount.toString(),
            communication: s.communication,
            counterpartyIban: s.counterpartyIban,
            bankReference: s.bankReference,
        }));

    if (statementsToInsert.length > 0) {
        await drizzle.insert(bankStatements)
            .values(statementsToInsert)
            .onConflictDoNothing();
    }
}

export const clearBankStatements = async (drizzle: DatabaseProvider) => {
    const { sql } = require('drizzle-orm');
    await drizzle.execute(sql`TRUNCATE TABLE pepol_app.bank_statements RESTART IDENTITY CASCADE`);
};