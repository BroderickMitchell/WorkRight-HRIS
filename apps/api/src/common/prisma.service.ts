import { INestApplication, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    // CRITICAL: Don't block module initialization with database connection
    // Cloud Run needs the app to listen on PORT before the startup probe times out
    // Prisma will lazily connect on first query anyway
    const isCloudRun = process.env.CLOUD_RUN === 'true';

    if (isCloudRun) {
      // In Cloud Run, connect in background to not block startup
      this.logger.log('Cloud Run detected - connecting to database in background...');
      this.$connect()
        .then(() => this.logger.log('✅ Prisma connected to database'))
        .catch((err) => this.logger.error('❌ Prisma connection failed:', err));
    } else {
      // Local development - connect synchronously for fail-fast behavior
      this.logger.log('Connecting to database...');
      await this.$connect();
      this.logger.log('✅ Prisma connected to database');
    }
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
