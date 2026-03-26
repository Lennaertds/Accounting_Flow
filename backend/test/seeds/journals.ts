// test/seeds/journals.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { journals } from '../../src/drizzle/schema';
import { SEED_JOURNALS } from '../../src/drizzle/seed-data';

export const seedJournals = async (drizzle: DatabaseProvider, orgId: string) => {
    const journalsToInsert = SEED_JOURNALS.map(j => ({
        orgId: orgId,
        name: j.name,
        code: j.code,
        type: j.type, 
    }));

    await drizzle.insert(journals)
        .values(journalsToInsert)
        .onConflictDoNothing();
}

export const clearJournals = async (drizzle: DatabaseProvider) => {
    const { sql } = require('drizzle-orm');
    await drizzle.execute(sql`TRUNCATE TABLE journals RESTART IDENTITY CASCADE`);
};