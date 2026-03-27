// test/seeds/transactions.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { transactions, journalEntries, ledgerAccounts, analyticAccounts } from '../../src/drizzle/schema';
import { SEED_TRANSACTIONS } from '../../src/drizzle/seed-data';
import { eq } from 'drizzle-orm';

export const seedTransactions = async (drizzle: DatabaseProvider, orgId: string) => {
    const entries = await drizzle.select().from(journalEntries).where(eq(journalEntries.orgId, orgId));
    const ledgers = await drizzle.select().from(ledgerAccounts);
    const analytics = await drizzle.select().from(analyticAccounts).where(eq(analyticAccounts.orgId, orgId));

    const transactionsToInsert = SEED_TRANSACTIONS.map(seed => {
        const entry = entries.find(e => e.description === seed.entryDescription);
        const ledger = ledgers.find(l => l.code === seed.ledgerCode);
        const analytic = seed.analyticCode 
            ? analytics.find(a => a.code === seed.analyticCode) 
            : null;

        if (!entry || !ledger) {
            console.warn(`⚠️ Skipping seed transaction: Entry "${seed.entryDescription}" or Ledger ${seed.ledgerCode} not found.`);
            return null;
        }

        return {
            orgId: orgId,
            entryId: entry.id,
            ledgerId: ledger.id,
            analyticAccountId: analytic?.id || null,
            amount: seed.amount, 
            isReconciled: false,
        };
    }).filter((t): t is NonNullable<typeof t> => t !== null);

    if (transactionsToInsert.length > 0) {
        await drizzle.insert(transactions).values(transactionsToInsert);
    }
}

export const clearTransactions = async (drizzle: DatabaseProvider) => {
    const { sql } = require('drizzle-orm');
    await drizzle.execute(sql`TRUNCATE TABLE transactions RESTART IDENTITY CASCADE`);
};