import request from 'supertest';
import { INestApplication } from '@nestjs/common';
  it('returns composer context for manager', async () => {
    const res = await request(app.getHttpServer())
      .get('/communications/context')
      .set(buildHeaders(managerToken));

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('MANAGER');
    expect(res.body.teams.length).toBeGreaterThan(0);
  });

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/common/prisma.service.js';
import { closeTestingApp, createTestingApp } from './utils/test-app.js';
import { RoleKey } from '@prisma/client';

const hasDb = !!process.env.DATABASE_URL;

const TENANT_ID = 'tenant-comm';
const ADMIN_ID = 'user-admin';
const MANAGER_ID = 'user-manager';
const SUPERVISOR_ID = 'user-supervisor';
const EMPLOYEE_ID = 'user-employee';
const EMPLOYEE_MULTI_ID = 'user-employee-multi';

const TEAM_ALPHA = 'team-alpha';
const TEAM_BRAVO = 'team-bravo';
const TEAM_DELTA = 'team-delta';

const buildHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'X-Tenant-Id': TENANT_ID
});

(hasDb ? describe : describe.skip)('Communications module', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  let adminToken: string;
  let managerToken: string;
  let supervisorToken: string;
  let employeeToken: string;
  let employeeMultiToken: string;

  beforeAll(async () => {
    app = await createTestingApp();
    prisma = app.get(PrismaService);
    jwt = new JwtService({ secret: process.env.AUTH_SECRET ?? 'change-me' });

    await prisma.communicationPostRecipient.deleteMany({});
    await prisma.communicationPost.deleteMany({});
    await prisma.team.deleteMany({});
    await prisma.department.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.tenant.deleteMany({});

    await prisma.tenant.create({
      data: {
        id: TENANT_ID,
        name: 'Comms Tenant',
        slug: 'comm-tenant',
        locale: 'en-AU',
        region: 'ap-southeast-2',
        dataResidencyAU: true,
        settings: {}
      }
    });

    const opsDept = await prisma.department.create({
      data: {
        id: 'dept-ops',
        tenantId: TENANT_ID,
        name: 'Operations',
        status: 'ACTIVE'
      }
    });

    const otherDept = await prisma.department.create({
      data: {
        id: 'dept-other',
        tenantId: TENANT_ID,
        name: 'Other',
        status: 'ACTIVE'
      }
    });

    const admin = await prisma.user.create({
      data: {
        id: ADMIN_ID,
        tenantId: TENANT_ID,
        email: 'admin@example.com',
        givenName: 'Ada',
        familyName: 'Admin',
        roles: [RoleKey.SYSTEM_OWNER]
      }
    });

    const manager = await prisma.user.create({
      data: {
        id: MANAGER_ID,
        tenantId: TENANT_ID,
        email: 'manager@example.com',
        givenName: 'Manny',
        familyName: 'Manager',
        departmentId: opsDept.id,
        roles: [RoleKey.MANAGER]
      }
    });

    const supervisor = await prisma.user.create({
      data: {
        id: SUPERVISOR_ID,
        tenantId: TENANT_ID,
        email: 'supervisor@example.com',
        givenName: 'Sage',
        familyName: 'Supervisor',
        departmentId: opsDept.id,
        roles: [RoleKey.SUPERVISOR]
      }
    });

    const employee = await prisma.user.create({
      data: {
        id: EMPLOYEE_ID,
        tenantId: TENANT_ID,
        email: 'employee@example.com',
        givenName: 'Eve',
        familyName: 'Employee',
        departmentId: opsDept.id,
        roles: [RoleKey.EMPLOYEE],
        allowMultiTeamCommunication: false
      }
    });

    const employeeMulti = await prisma.user.create({
      data: {
        id: EMPLOYEE_MULTI_ID,
        tenantId: TENANT_ID,
        email: 'multi@example.com',
        givenName: 'Mila',
        familyName: 'Multi',
        departmentId: opsDept.id,
        roles: [RoleKey.EMPLOYEE],
        allowMultiTeamCommunication: true
      }
    });

    await prisma.team.create({
      data: {
        id: TEAM_ALPHA,
        tenantId: TENANT_ID,
        name: 'Alpha Crew',
        departmentId: opsDept.id,
        members: {
          connect: [
            { id: manager.id },
            { id: employee.id },
            { id: employeeMulti.id }
          ]
        },
        supervisors: {
          connect: [{ id: supervisor.id }]
        }
      }
    });

    await prisma.team.create({
      data: {
        id: TEAM_BRAVO,
        tenantId: TENANT_ID,
        name: 'Bravo Squad',
        departmentId: opsDept.id,
        members: {
          connect: [{ id: manager.id }]
        }
      }
    });

    await prisma.team.create({
      data: {
        id: TEAM_DELTA,
        tenantId: TENANT_ID,
        name: 'Delta Ops',
        departmentId: otherDept.id,
        members: {
          connect: [{ id: admin.id }]
        }
      }
    });

    adminToken = jwt.sign({ sub: admin.id, tenantId: TENANT_ID, roles: 'HR_ADMIN' });
    managerToken = jwt.sign({ sub: manager.id, tenantId: TENANT_ID, roles: 'MANAGER' });
    supervisorToken = jwt.sign({ sub: supervisor.id, tenantId: TENANT_ID, roles: 'SUPERVISOR' });
    employeeToken = jwt.sign({ sub: employee.id, tenantId: TENANT_ID, roles: 'EMPLOYEE' });
    employeeMultiToken = jwt.sign({ sub: employeeMulti.id, tenantId: TENANT_ID, roles: 'EMPLOYEE' });
  });

  afterAll(async () => {
    await closeTestingApp(app);
  });

  beforeEach(async () => {
    await prisma.communicationPostRecipient.deleteMany({});
    await prisma.communicationPost.deleteMany({});
  });

  it('returns composer context for manager', async () => {
    const res = await request(app.getHttpServer())
      .get('/communications/context')
      .set(buildHeaders(managerToken));

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('MANAGER');
    expect(res.body.teams.length).toBeGreaterThan(0);
  });

  it('allows an administrator to create a post targeting multiple departments', async () => {
    const res = await request(app.getHttpServer())
      .post('/communications')
      .set(buildHeaders(adminToken))
      .send({
        title: 'All hands update',
        body: 'Company-wide announcement',
        targetTeamIds: [TEAM_ALPHA, TEAM_DELTA]
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('All hands update');
    expect(res.body.targetTeams).toHaveLength(2);

    const recipients = await prisma.communicationPostRecipient.findMany();
    const recipientIds = recipients.map((r) => r.userId);
    expect(recipients).toHaveLength(4);
    expect(recipientIds).toEqual(expect.arrayContaining([MANAGER_ID, SUPERVISOR_ID, EMPLOYEE_ID, EMPLOYEE_MULTI_ID]));
    expect(recipientIds).not.toContain(ADMIN_ID);
  });

  it('prevents an employee without multi-team flag from targeting other teams', async () => {
    const res = await request(app.getHttpServer())
      .post('/communications')
      .set(buildHeaders(employeeToken))
      .send({
        title: 'Cross team ping',
        body: 'Trying to reach another team',
        targetTeamIds: [TEAM_BRAVO]
      });

    expect(res.status).toBe(403);
  });

  it('allows an employee with multi-team flag to target within their department', async () => {
    const res = await request(app.getHttpServer())
      .post('/communications')
      .set(buildHeaders(employeeMultiToken))
      .send({
        title: 'Shared equipment update',
        body: 'Heads up across crews',
        targetTeamIds: [TEAM_ALPHA, TEAM_BRAVO]
      });

    expect(res.status).toBe(201);
    expect(res.body.targetTeams).toHaveLength(2);
  });

  it('enforces acknowledgement flow for pending recipients', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/communications')
      .set(buildHeaders(managerToken))
      .send({
        title: 'Safety briefing',
        body: 'Please review the latest safety notes',
        targetTeamIds: [TEAM_ALPHA],
        requireAck: true
      });
    expect(createRes.status).toBe(201);

    const postId = createRes.body.id;

    const ackListRes = await request(app.getHttpServer())
      .get('/communications/acks/mine')
      .set(buildHeaders(employeeToken));

    expect(ackListRes.status).toBe(200);
    expect(ackListRes.body.items).toHaveLength(1);
    expect(ackListRes.body.items[0].post.id).toBe(postId);

    const ackRes = await request(app.getHttpServer())
      .post(`/communications/${postId}/ack`)
      .set(buildHeaders(employeeToken));
    expect(ackRes.status).toBe(201);
    expect(ackRes.body.myAck.acknowledged).toBe(true);
  });
});
