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
    let isShuttingDown = false;

    const handleShutdown = async () => {
      if (isShuttingDown) {
        return;
      }

      isShuttingDown = true;

      try {
        await app.close();
      } finally {
        await this.$disconnect();
      }
    };

    const signals = ['SIGINT', 'SIGTERM'] as const;

    signals.forEach((signal) => {
      process.on(signal, () => {
        void handleShutdown();
      });
    });

    process.on('beforeExit', () => {
      void handleShutdown();
    });
  }
}
