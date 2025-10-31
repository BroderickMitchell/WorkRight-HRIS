import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { closeTestingApp, createTestingApp } from './utils/test-app.js';

const hasDb = !!process.env.DATABASE_URL;

(hasDb ? describe : describe.skip)('Health', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    await closeTestingApp(app);
  });

  it('returns ok', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
