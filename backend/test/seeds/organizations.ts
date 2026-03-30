// test/seeds/organizations.ts
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';
import { organizations } from '../../src/drizzle/schema';
import { SEED_ORGANIZATIONS } from '../../src/drizzle/seed-data';

export const seedOrganizations = async (drizzle: DatabaseProvider) => {
  const organizationsToInsert = SEED_ORGANIZATIONS.map((o) => ({
      name: o.name,
      vat: o.vat,
      iban: o.iban,
  }));

  const results = await drizzle
    .insert(organizations)
    .values(organizationsToInsert)
    .returning();

  return results;
};

export const clearOrganizations = async (drizzle: DatabaseProvider) => {
    const { sql } = require('drizzle-orm');
    await drizzle.execute(sql`TRUNCATE TABLE pepol_app.organizations RESTART IDENTITY CASCADE`);
};