// src/common/prisma.service.ts
import { Injectable, INestApplication, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // PrismaClientOptions can include log or datasource, but no "extensions" in v6
    super({});
  }

  async onModuleInit() {
    await this.$connect();

    // Optional middleware: cast to 'any' so TS doesn’t complain
    (this as any).$use(async (params: any, next: (p: any) => Promise<any>) => {
      // Example: intercept queries, add logging, etc.
      return next(params);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  setupShutdownHooks(app: INestApplication) {
    const shutdown = async () => {
      try {
        await app.close();
      } finally {
        await this.$disconnect();
      }
    };

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
    process.once('beforeExit', shutdown);
  }
}
