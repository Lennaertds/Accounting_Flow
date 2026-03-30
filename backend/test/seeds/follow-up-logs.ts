// test/seeds/follow-up-logs.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { followUpLogs, users } from '../../src/drizzle/schema';
import { SEED_FOLLOW_UP_LOGS } from '../../src/drizzle/seed-data';
import { eq } from 'drizzle-orm';

export const seedFollowUpLogs = async (
    drizzle: DatabaseProvider, 
    orgId: string,
    orgSeedKey: string = 'ALPHA'
) => {
    const existingUsers = await drizzle.select()
        .from(users)
        .where(eq(users.orgId, orgId))
        .limit(1);

    if (existingUsers.length === 0) {
        throw new Error(`Kan geen follow-up logs seeden: geen gebruikers gevonden voor orgId ${orgId}`);
    }

    const userId = existingUsers[0].id;

    const logsToInsert = SEED_FOLLOW_UP_LOGS
        .filter(log => log.orgSeedKey === orgSeedKey)
        .map(log => ({
            orgId: orgId,
            userId: userId, 
            actionTaken: log.actionTaken,
            statusAfterAction: log.statusAfterAction,
            matchP5P1Id: null,
            matchP2P4Id: null,
        }));

    if (logsToInsert.length > 0) {
        await drizzle.insert(followUpLogs)
            .values(logsToInsert)
            .onConflictDoNothing();
    }
}

export const clearFollowUpLogs = async (drizzle: DatabaseProvider) => {
    const { sql } = require('drizzle-orm');
    await drizzle.execute(sql`TRUNCATE TABLE pepol_app.follow_up_logs RESTART IDENTITY CASCADE`);
};