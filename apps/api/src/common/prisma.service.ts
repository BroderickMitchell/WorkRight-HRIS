import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// IMPORTANT: Prisma 5+ (library engine) does not support prisma.$on('beforeExit').
// We bind to process signals instead.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    const shutdown = async () => {
      try {
        await this.$disconnect();
      } finally {
        await app.close();
      }
    };

    // These are safe and supported
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // Use Node's beforeExit instead of prisma.$on('beforeExit')
    process.on('beforeExit', async () => {
      await this.$disconnect();
    });
  }
}
