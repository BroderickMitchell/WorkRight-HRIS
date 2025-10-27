import { Injectable, INestApplication, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

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

type QueryContext = {
  model?: string;
  operation: string;
  args?: Record<string, unknown>;
  query: (args?: Record<string, unknown>) => Promise<unknown>;
};

const tenantExtension = Prisma.defineExtension({
  name: 'tenant-guard',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }: QueryContext) {
        if (!model || !TENANTED_MODELS.has(model)) {
          return query(args);
        }

        const tenantId = getTenantId();

        if (!tenantId) {
          if (operation.startsWith('find')) {
            const baseArgs = { ...(args ?? {}) };
            const guardedArgs: Record<string, unknown> = {
              ...baseArgs,
              where: {
                ...((baseArgs.where as Record<string, unknown> | undefined) ?? {}),
                tenantId: '__NO_TENANT__'
              }
            };

            return query(guardedArgs);
          }

          throw new Error('Tenant context missing');
        }

        const nextArgs: Record<string, unknown> = { ...(args ?? {}) };
        const where = {
          ...((nextArgs.where as Record<string, unknown> | undefined) ?? {}),
          tenantId
        };

        switch (operation) {
          case 'findUnique':
          case 'findFirst':
          case 'findMany':
          case 'count':
          case 'aggregate':
          case 'groupBy':
            nextArgs.where = where;
            break;
          case 'create':
            nextArgs.data = {
              ...((nextArgs.data as Record<string, unknown> | undefined) ?? {}),
              tenantId
            };
            break;
          case 'createMany':
            if (Array.isArray(nextArgs.data)) {
              nextArgs.data = nextArgs.data.map((row) => ({
                ...(row as Record<string, unknown>),
                tenantId
              }));
            } else if (nextArgs.data) {
              nextArgs.data = {
                ...((nextArgs.data as Record<string, unknown>) ?? {}),
                tenantId
              };
            }
            break;
          case 'update':
          case 'updateMany':
          case 'delete':
          case 'deleteMany':
            nextArgs.where = where;
            break;
          case 'upsert':
            nextArgs.where = where;
            nextArgs.create = {
              ...((nextArgs.create as Record<string, unknown> | undefined) ?? {}),
              tenantId
            };
            break;
          default:
            break;
        }

        return query(nextArgs);
      }
    }
  }
});

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      extensions: TENANT_MIDDLEWARE_ENABLED ? [tenantExtension] : []
    });
  }

  async onModuleInit() {
    await this.$connect();
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
