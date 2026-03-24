// test/seeds/analytic-accounts.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { analyticAccounts } from '../../src/drizzle/schema';

export async function seedAnalyticAccount(
  db: DatabaseProvider, 
  orgId: string, 
  name: string = 'Marketing'
) {
  const [result] = await db.insert(analyticAccounts)
    .values({
      orgId,
      name,
    })
    .returning();
  return result;
}