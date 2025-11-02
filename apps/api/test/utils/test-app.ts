import { INestApplication } from '@nestjs/common';
import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ClsService } from 'nestjs-cls';
import { AppModule } from '../../src/modules/app.module.js';
import { PrismaService } from '../../src/common/prisma.service.js';
import { TenantGuard } from '../../src/common/tenant.guard.js';
import { JwtStrategy } from '../../src/common/auth/jwt.strategy.js';
import { RolesGuard } from '../../src/common/auth/roles.guard.js';
import { SeedController } from '../../src/modules/admin/seed.controller.js';
import { RostersController } from '../../src/modules/rosters/rosters.controller.js';
import { RostersService } from '../../src/modules/rosters/rosters.service.js';
import { TravelController } from '../../src/modules/travel/travel.controller.js';
import { TravelService } from '../../src/modules/travel/travel.service.js';
import { PayrollController } from '../../src/modules/payroll/payroll.controller.js';
import { PayrollService } from '../../src/modules/payroll/payroll.service.js';

export async function createTestingApp(): Promise<INestApplication> {
  // Vitest relies on esbuild, which drops decorator metadata. Re-register the constructor dependencies we need.
  Reflect.defineMetadata('design:paramtypes', [ClsService, ConfigService], TenantGuard);
  Reflect.defineMetadata('design:paramtypes', [ConfigService], JwtStrategy);
  Reflect.defineMetadata('design:paramtypes', [Reflector], RolesGuard);
  Reflect.defineMetadata('design:paramtypes', [PrismaService], SeedController);
  Reflect.defineMetadata('design:paramtypes', [RostersService], RostersController);
  Reflect.defineMetadata('design:paramtypes', [TravelService], TravelController);
  Reflect.defineMetadata('design:paramtypes', [PayrollService], PayrollController);

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule]
  })
    .overrideGuard(TenantGuard)
    .useFactory({
      inject: [ClsService, ConfigService],
      useFactory: (cls: ClsService, config: ConfigService) => new TenantGuard(cls, config)
    })
    .compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  return app;
}

export async function closeTestingApp(app?: INestApplication | null) {
  if (!app) return;

  let prisma: PrismaService | undefined;
  try {
    prisma = app.get(PrismaService);
  } catch {
    prisma = undefined;
  }

  if (prisma) {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore disconnect errors in tests
    }
  }

  await app.close();
}
