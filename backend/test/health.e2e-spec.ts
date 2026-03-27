// test/health.e2e.spec.ts
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers/create-app';

describe('HealthController (E2E)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createApp();
    });

    describe('GET /api/health/ping', () => {
        it('should return pong without authentication', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/health/ping'); 

            expect(response.statusCode).toBe(200);
            expect(response.text).toBe('pong');
        });
    });

    afterAll(async () => {
        await app.close();
    });
});