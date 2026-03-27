// test/seeds/journal-entries.ts
import { SEED_JOURNAL_ENTRIES } from '../../src/drizzle/seed-data';
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { journalEntries, journals } from '../../src/drizzle/schema';
import { eq } from 'drizzle-orm';

export const seedJournalEntries = async (drizzle: DatabaseProvider, orgId: string) => {
    const orgJournals = await drizzle
        .select()
        .from(journals)
        .where(eq(journals.orgId, orgId));

    if (orgJournals.length === 0) {
        throw new Error(`Kan geen entries seeden: Geen journals gevonden voor org ${orgId}`);
    }

    const defaultJournalId = orgJournals[0].id;

    const entriesToInsert = SEED_JOURNAL_ENTRIES.map(entry => ({
        orgId: orgId,
        journalId: defaultJournalId,
        date: entry.date,
        description: entry.description,
    }));

    await drizzle.insert(journalEntries).values(entriesToInsert).onConflictDoNothing();
};

export const clearJournalEntries = async (drizzle: DatabaseProvider) => {
    const { sql } = require('drizzle-orm');
    await drizzle.execute(sql`TRUNCATE TABLE journal_entries RESTART IDENTITY CASCADE`);
};