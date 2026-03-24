// test/analytic-account.controller.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';
import { DatabaseProvider } from '../src/drizzle/drizzle.provider';
import { seedOrganization } from './seeds/organizations';
import { organizations, analyticAccounts } from '../src/drizzle/schema';
import { eq } from 'drizzle-orm';

describe('AnalyticAccountController (e2e)', () => {
  let app: INestApplication;
  let db: DatabaseProvider;
  let testOrgId: string;

  beforeAll(async () => {
    app = await createApp();
    db = app.get<DatabaseProvider>('DRIZZLE_CONNECTION');
    
    // We hebben een organisatie nodig als basis
    const org = await seedOrganization(db);
    testOrgId = org.id;
  });

  afterAll(async () => {
    // Clean up
    await db.delete(analyticAccounts).where(eq(analyticAccounts.orgId, testOrgId));
    await db.delete(organizations).where(eq(organizations.id, testOrgId));
    await app.close();
  });

  it('POST /analytic-accounts - moet een kostenplaats aanmaken', async () => {
    const payload = {
      name: 'R&D Afdeling',
      orgId: testOrgId,
    };

    const response = await request(app.getHttpServer())
      .post('/analytic-accounts')
      .send(payload)
      .expect(201);

    expect(response.body.name).toBe(payload.name);
    expect(response.body.orgId).toBe(testOrgId);
    expect(response.body.id).toBeDefined();
  });

  it('GET /analytic-accounts - moet kostenplaatsen ophalen voor een organisatie', async () => {
    const response = await request(app.getHttpServer())
      .get(`/analytic-accounts?orgId=${testOrgId}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].orgId).toBe(testOrgId);
  });

  it('PUT /analytic-accounts/:id - moet de naam updaten', async () => {
    const [newAccount] = await db.insert(analyticAccounts)
      .values({ name: 'Temp', orgId: testOrgId })
      .returning();

    const updatePayload = { name: 'IT Support' };

    const response = await request(app.getHttpServer())
      .put(`/analytic-accounts/${newAccount.id}`)
      .send(updatePayload)
      .expect(200);

    expect(response.body.name).toBe('IT Support');
  });

  it('DELETE /analytic-accounts/:id - moet een account verwijderen', async () => {
    const [tempAccount] = await db.insert(analyticAccounts)
      .values({ name: 'To Delete', orgId: testOrgId })
      .returning();

    await request(app.getHttpServer())
      .delete(`/analytic-accounts/${tempAccount.id}`)
      .expect(200);

    const check = await db.select()
      .from(analyticAccounts)
      .where(eq(analyticAccounts.id, tempAccount.id));
    
    expect(check.length).toBe(0);
  });
});