import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();

    // Example middleware (optional)
    this.$use(async (params, next) => {
      // You can modify params here if needed
      return next(params);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
