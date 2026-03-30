// test/seeds/analytic-accounts.ts
import { SEED_ANALYTIC_ACCOUNTS } from '../../src/drizzle/seed-data';
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { analyticAccounts } from '../../src/drizzle/schema';
import { sql } from 'drizzle-orm';

export const seedAnalyticAccounts = async (drizzle: DatabaseProvider, orgId: string) => {
    const accountsToInsert = SEED_ANALYTIC_ACCOUNTS.map(acc => ({
        orgId: orgId,
        name: acc.name,
        code: acc.code,
        active: true,
    }));

    await drizzle
        .insert(analyticAccounts)
        .values(accountsToInsert)
        .onConflictDoNothing();
}

export const clearAnalyticAccounts = async (drizzle: DatabaseProvider) => {
    await drizzle.execute(sql`TRUNCATE TABLE pepol_app.analytic_accounts RESTART IDENTITY CASCADE`);
};