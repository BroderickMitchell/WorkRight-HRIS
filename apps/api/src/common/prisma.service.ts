import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  enableShutdownHooks(app: INestApplication) {
    const FLAG = '__WR_PRISMA_SHUTDOWN_HOOKS__';
    // @ts-ignore
    if ((global as any)[FLAG]) return;
    // @ts-ignore
    (global as any)[FLAG] = true;

    const shutdown = async () => {
      try {
        await this.$disconnect();
      } finally {
        await app.close();
      }
    };

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
    process.once('beforeExit', async () => {
      await this.$disconnect();
    });
  }
}
