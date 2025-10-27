import { Injectable, INestApplication, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Simple per-request tenant accessor.
 * Replace this with your real tenant resolver (e.g. AsyncLocalStorage, request-scoped service, or a header parser).
 */
function getTenantId(): string | null {
  // TODO: wire this to your actual context (e.g. ALS store.getStore()?.tenantId)
  return null;
}

/**
 * List the Prisma models you want the middleware to scope by tenant.
 * If your schema uses another field name (e.g. organisationId), change here.
 */
const TENANTED_MODELS = new Set<string>([
  'Employee',
  'EmployeeAddress',
  'EmployeeEmergencyContact',
  'EmployeeCostSplit',
  'GeneratedDocument',
  'EmploymentEvent',
  // add all tenant-scoped models here
]);

/**
 * Whether to enable multi-tenant middleware. Toggle via env for local dev.
 * e.g. PRISMA_TENANT_MIDDLEWARE=1
 */
const TENANT_MIDDLEWARE_ENABLED = process.env.PRISMA_TENANT_MIDDLEWARE === '1';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();

    if (TENANT_MIDDLEWARE_ENABLED) {
      this.$use(async (params, next) => {
        const { model, action } = params;

        if (!model || !TENANTED_MODELS.has(model)) {
          return next(params);
        }

        const tenantId = getTenantId();

        if (!tenantId) {
          if (action.startsWith('find')) {
            params.args = params.args ?? {};
            params.args.where = { ...(params.args.where ?? {}), tenantId: '__NO_TENANT__' };
            return next(params);
          }

          throw new Error('Tenant context missing');
        }

        params.args = params.args ?? {};

        switch (action) {
          case 'findUnique':
          case 'findFirst':
          case 'findMany':
          case 'count':
          case 'aggregate':
          case 'groupBy':
            params.args.where = { ...(params.args.where ?? {}), tenantId };
            break;
          case 'create':
            params.args.data = { ...(params.args.data ?? {}), tenantId };
            break;
          case 'createMany':
            if (Array.isArray(params.args.data)) {
              params.args.data = params.args.data.map((row: Record<string, unknown>) => ({
                ...row,
                tenantId
              }));
            } else if (params.args.data) {
              params.args.data = { ...(params.args.data as Record<string, unknown>), tenantId };
            }
            break;
          case 'update':
          case 'updateMany':
          case 'delete':
          case 'deleteMany':
            params.args.where = { ...(params.args.where ?? {}), tenantId };
            break;
          case 'upsert':
            params.args.where = { ...(params.args.where ?? {}), tenantId };
            params.args.create = { ...(params.args.create ?? {}), tenantId };
            break;
          default:
            break;
        }

        return next(params);
      });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    (this as PrismaClient).$on('beforeExit', async () => {
      await app.close();
    });
  }
}
