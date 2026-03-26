// test/seeds/ledger-accounts.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { ledgerAccounts } from '../../src/drizzle/schema';
import { SEED_LEDGER_ACCOUNTS } from '../../src/drizzle/seed-data';

export const seedLedgerAccounts = async (drizzle: DatabaseProvider, orgId: string) => {
    const accountsToInsert = SEED_LEDGER_ACCOUNTS.map(a => ({
        orgId: orgId,
        code: a.code,
        name: a.name,
        category: a.category,
    }));

    await drizzle.insert(ledgerAccounts)
        .values(accountsToInsert).onConflictDoNothing();
}

export const clearLedgerAccounts = async (drizzle: DatabaseProvider) => {
    const { sql } = require('drizzle-orm');
    await drizzle.execute(sql`TRUNCATE TABLE pepol_app.ledger_accounts RESTART IDENTITY CASCADE`);
};