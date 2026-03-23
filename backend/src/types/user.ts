// backend/src/types/user.ts
import { users } from '../drizzle/schema';
export type InternalUser = typeof users.$inferSelect;
export type User = Omit<InternalUser, 'passwordHash'>;