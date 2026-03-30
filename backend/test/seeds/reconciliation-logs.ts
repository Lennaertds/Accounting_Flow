// test/seeds/reconciliation-logs.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { reconciliationLogs } from '../../src/drizzle/schema';
import { MatchType } from '../../src/banking/reconciliation-log.dto';

export const seedReconciliationLogs = async (
    drizzle: DatabaseProvider, 
    orgId: string,
    refs?: { bankStatementId: string; journalEntryId: string; transactionId: string }
) => {
    const logsToInsert = [
        {
            orgId: orgId,
            bankStatementId: refs?.bankStatementId,
            journalEntryId: refs?.journalEntryId,
            transactionId: refs?.transactionId,
            matchType: MatchType.MANUAL,
            reconciledAt: new Date(),
        }
    ];

    await drizzle.insert(reconciliationLogs)
        .values(logsToInsert)
        .onConflictDoNothing();
}

export const clearReconciliationLogs = async (drizzle: DatabaseProvider) => {
    const { sql } = require('drizzle-orm');
    await drizzle.execute(sql`TRUNCATE TABLE pepol_app.reconciliation_logs RESTART IDENTITY CASCADE`);
};