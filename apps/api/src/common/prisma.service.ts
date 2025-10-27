import {
  INestApplication,
  Injectable,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly cls: ClsService) {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
    });
  }

  async onModuleInit() {
    // Enforce tenant context for every query.
    const tenantMiddleware: Prisma.Middleware = async (params, next) => {
      const tenantId = this.cls.get('tenantId');
      if (params.model === 'Tenant') {
        return next(params);
      }
      if (!tenantId) {
        return next(params);
      }
      if (!params.args) {
        params.args = {};
      }
      if (
        ['findMany', 'findFirst', 'updateMany', 'deleteMany', 'count', 'aggregate'].includes(
          params.action
        )
      ) {
        params.args.where = { ...(params.args.where ?? {}), tenantId };
      } else if (['findUnique', 'findUniqueOrThrow', 'update', 'delete'].includes(params.action)) {
        const ensureTenantInWhere = (value: unknown): boolean => {
          if (!value || typeof value !== 'object') {
            return false;
          }
          if ('tenantId' in (value as Record<string, unknown>)) {
            return true;
          }
          return Object.values(value).some((nested) => ensureTenantInWhere(nested));
        };

        if (!params.args.where || !ensureTenantInWhere(params.args.where)) {
          throw new Error(
            `Tenant scoped ${params.model}.${params.action} requires a tenant identifier in the unique selector.`
          );
        }

        if ('tenantId' in params.args.where) {
          params.args.where = { ...params.args.where, tenantId };
        }
      } else if (['create', 'createMany'].includes(params.action)) {
        params.args.data = Array.isArray(params.args.data)
          ? params.args.data.map((item: any) => ({ ...item, tenantId }))
          : { ...params.args.data, tenantId };
      } else if (params.action === 'upsert') {
        if (params.args.create) {
          params.args.create = { ...params.args.create, tenantId };
        }
        if (params.args.update) {
          params.args.update = { ...params.args.update, tenantId };
        }
      }
      return next(params);
    };

    this.$use(tenantMiddleware);

    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    // With Prisma library engine (v5+), use process.beforeExit instead of Client $on('beforeExit')
    process.on('beforeExit', async () => {
      try { await app.close(); } catch {}
    });
  }
}
