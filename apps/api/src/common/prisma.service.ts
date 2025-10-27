// src/common/prisma.service.ts
import { Injectable, INestApplication, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

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
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();

    if (TENANT_MIDDLEWARE_ENABLED) {
      // One middleware to enforce tenant scoping on reads/writes
      const tenantMiddleware: Prisma.Middleware = async (params, next) => {
        const { model, action } = params;

        // Only apply to selected models
        if (!model || !TENANTED_MODELS.has(model)) {
          return next(params);
        }

        const tenantId = getTenantId();
        if (!tenantId) {
          // No tenant in context; for safety, block writes and return empty reads.
          // Adjust to your needs (e.g. throw ForbiddenException).
          if (action.startsWith('find')) {
            // Return empty results for find ops by scoping to impossible where
            params.args = params.args ?? {};
            params.args.where = { ...(params.args.where ?? {}), tenantId: '__NO_TENANT__' };
            return next(params);
          }
          throw new Error('Tenant context missing');
        }

        // Read actions: merge tenantId into where
        if (
          action === 'findUnique' ||
          action === 'findFirst' ||
          action === 'findMany' ||
          action === 'count' ||
          action === 'aggregate' ||
          action === 'groupBy'
        ) {
          params.args = params.args ?? {};
          // Ensure where exists and add tenantId guard
          params.args.where = { ...(params.args.where ?? {}), tenantId };
        }

        // Write actions: enforce tenant on create/update/upsert/delete
        if (action === 'create') {
          params.args = params.args ?? {};
          params.args.data = { ...(params.args.data ?? {}), tenantId };
        }

        if (action === 'createMany') {
          params.args = params.args ?? {};
          const data = params.args.data ?? [];
          params.args.data = Array.isArray(data)
            ? data.map((row: any) => ({ ...row, tenantId }))
            : { ...data, tenantId };
        }

        if (action === 'update' || action === 'updateMany' || action === 'upsert' || action === 'delete' || action === 'deleteMany') {
          params.args = params.args ?? {};
          // Guard the where with tenantId so you never write across tenants
          params.args.where = { ...(params.args.where ?? {}), tenantId };

          // For upsert, also ensure create side carries tenantId
          if (action === 'upsert') {
            params.args.create = { ...(params.args.create ?? {}), tenantId };
          }
        }

        return next(params);
      };

      this.$use(tenantMiddleware);
    }

    // Example: another middleware slot (audit, etc)
    this.$use(async (params, next) => {
      // add any cross-cutting behaviour here (timing, logging)
      return next(params);
    });
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
