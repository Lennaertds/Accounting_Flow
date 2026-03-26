// test/seeds/users.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { users } from '../../src/drizzle/schema';
import * as argon2 from 'argon2';
import { Role } from '../../src/auth/roles';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';
import { SEED_USERS } from '../../src/drizzle/seed-data';
import { SeedUser } from '../../src/drizzle/seed-types';

export const seedUsers = async (app: INestApplication, drizzle: DatabaseProvider, orgId: string) => {
    const authService = app.get(AuthService);
    const passwordHash = await authService.hashPassword('password123');

    const usersToInsert = SEED_USERS.map((u) => ({
        orgId: orgId,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role,
        passwordHash: passwordHash,
    }));

    await drizzle.insert(users).values(usersToInsert).onConflictDoNothing();
};

export const clearUsers = async (drizzle: DatabaseProvider) => {
    const { sql } = require('drizzle-orm');
    await drizzle.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
};