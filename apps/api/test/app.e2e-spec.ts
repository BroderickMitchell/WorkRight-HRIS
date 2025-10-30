import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import { AppModule } from '../src/modules/app.module.js';

const hasDb = !!process.env.DATABASE_URL;

(hasDb ? describe : describe.skip)('Health', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: <T>(_key: string) => false as unknown as T
      })
      .overrideProvider(ClsService)
      .useValue({
        get: () => undefined,
        set: () => undefined
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns ok', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
