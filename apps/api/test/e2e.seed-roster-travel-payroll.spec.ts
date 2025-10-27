import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/modules/app.module.js';

// This e2e spec exercises: seed -> roster shifts -> travel plan/manifests -> payroll run
// Requires Postgres available per DATABASE_URL and migrations applied.

const hasDb = !!process.env.DATABASE_URL;

(hasDb ? describe : describe.skip)('E2E: seed -> rosters -> travel -> payroll', () => {
  let app: INestApplication;
  const tenantId = 'tenant-demo';

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('seeds demo tenant and entities', async () => {
    const res = await request(app.getHttpServer())
      .post('/admin/seed-mining')
      .set('X-Tenant-Id', tenantId);
    expect([200, 201]).toContain(res.status);
    expect(res.body).toMatchObject({ ok: true, tenantId });
  });

  it('returns generated shifts for the demo employee', async () => {
    const res = await request(app.getHttpServer())
      .get('/rosters/shifts')
      .query({ from: '2024-11-01', to: '2024-11-30', employeeId: 'emp-2' })
      .set('X-Tenant-Id', tenantId)
      .set('X-Roles', 'HR_ADMIN,MANAGER');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('plans travel for swing and fetches manifests', async () => {
    const plan = await request(app.getHttpServer())
      .post('/travel/plan')
      .set('X-Tenant-Id', tenantId)
      .set('X-Roles', 'HR_ADMIN,MANAGER')
      .send({ employeeId: 'emp-2', locationId: 'loc-karratha', swingDates: ['2024-11-04', '2024-11-12'] });
    expect([200, 201]).toContain(plan.status);

    const manifest = await request(app.getHttpServer())
      .get('/travel/manifests')
      .query({ date: '2024-11-04' })
      .set('X-Tenant-Id', tenantId)
      .set('X-Roles', 'HR_ADMIN,MANAGER,PAYROLL,AUDITOR');
    expect(manifest.status).toBe(200);
    expect(Array.isArray(manifest.body)).toBe(true);
  });

  it('creates a payroll run and lists runs (redaction for non-payroll roles)', async () => {
    const create = await request(app.getHttpServer())
      .post('/payroll/runs')
      .set('X-Tenant-Id', tenantId)
      .set('X-Roles', 'PAYROLL,HR_ADMIN')
      .send({ periodStart: '2024-11-01', periodEnd: '2024-11-30' });
    expect([200, 201]).toContain(create.status);
    expect(create.body).toHaveProperty('id');

    // As auditor (allowed by RBAC) amounts should be redacted by interceptor
    const listAsAuditor = await request(app.getHttpServer())
      .get('/payroll/runs')
      .set('X-Tenant-Id', tenantId)
      .set('X-Roles', 'AUDITOR');
    expect(listAsAuditor.status).toBe(200);
    expect(Array.isArray(listAsAuditor.body)).toBe(true);
    if (listAsAuditor.body.length > 0) {
      const run = listAsAuditor.body[0];
      expect(run.totalCents).toBeNull();
      if (Array.isArray(run.lines) && run.lines.length > 0) {
        expect(run.lines[0].amountCents).toBeNull();
      }
    }
  });
});
