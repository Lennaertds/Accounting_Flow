// test/seeds/organizations.ts
import { INestApplication } from '@nestjs/common';
import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { organizations } from '../../src/drizzle/schema';

export async function seedOrganizations(app: INestApplication, db: DatabaseProvider) {
  await db.insert(organizations).values([
    {
      name: 'Test ERP B.V.',
      myVatNr: 'BE0123456789',
      myIban: 'BE44123456789012',
    },
    {
      name: 'Second Org Corp',
      myVatNr: 'NL888888888B01',
      myIban: 'NL99INGB0001234567',
    }
  ]);
}