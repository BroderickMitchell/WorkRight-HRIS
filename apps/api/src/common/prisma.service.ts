import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly cls: ClsService) {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
    });
  }

  async onModuleInit() {
    await this.$connect();

    // Enforce tenant context for every query.
    this.$use(async (params: any, next: (params: any) => Promise<unknown>) => {
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
        params.args.where = { ...params.args.where, tenantId };
      } else if (['update', 'delete', 'findUnique'].includes(params.action)) {
        params.args.where = { ...params.args.where, tenantId };
      } else if (['create', 'createMany', 'upsert'].includes(params.action)) {
        params.args.data = Array.isArray(params.args.data)
          ? params.args.data.map((item: any) => ({ ...item, tenantId }))
          : { ...params.args.data, tenantId };
      }
      return next(params);
    });
  }

  async enableShutdownHooks(app: INestApplication) {
    // With Prisma library engine (v5+), use process.beforeExit instead of Client $on('beforeExit')
    process.on('beforeExit', async () => {
      try { await app.close(); } catch {}
    });
  }
}
