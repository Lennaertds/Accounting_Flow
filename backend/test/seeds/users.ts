// test/seeds/users.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';
import { users } from '../../src/drizzle/schema';
import { SEED_USERS } from '../../src/drizzle/seed-data';

export const seedUsers = async (
    app: INestApplication, 
    drizzle: DatabaseProvider, 
    orgId: string, 
    orgSeedKey: string = 'ALPHA'
) => {
    const authService = app.get(AuthService);
    const filteredUsers = SEED_USERS.filter(u => u.orgSeedKey === orgSeedKey);

    if (filteredUsers.length === 0) {
        return; 
    }

    const usersToInsert = await Promise.all(filteredUsers.map(async (u) => {
        const passwordToHash = u.password || 'password123';
        const passwordHash = await authService.hashPassword(passwordToHash);

        return {
            orgId: orgId, 
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            role: u.role,
            passwordHash: passwordHash,
        };
    }));

    await drizzle.insert(users).values(usersToInsert).onConflictDoNothing();
};

export const clearUsers = async (drizzle: DatabaseProvider) => {
    const { sql } = require('drizzle-orm');
    await drizzle.execute(sql`TRUNCATE TABLE pepol_app.users RESTART IDENTITY CASCADE`);
};