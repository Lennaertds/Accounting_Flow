// test/seeds/users.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { users } from '../../src/drizzle/schema';
import * as argon2 from 'argon2';

export async function seedUsers(db: DatabaseProvider, orgId: string) {
    const passwordHash = await argon2.hash('password123');
    
    await db.insert(users).values([
        {
            orgId,
            firstName: 'Piet',
            lastName: 'Piraat',
            email: 'test@example.com',
            passwordHash,
            role: 'ADMIN',
        },
        {
            orgId,
            firstName: 'Jan',
            lastName: 'Modaal',
            email: 'jan@example.com',
            passwordHash,
            role: 'VIEWER',
        }
    ]);
}