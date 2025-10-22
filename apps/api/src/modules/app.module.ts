import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { IdentityModule } from './identity/identity.module.js';
import { DirectoryModule } from './directory/directory.module.js';
import { PerformanceModule } from './performance/performance.module.js';
import { LeaveModule } from './leave/leave.module.js';
import { LearningModule } from './learning/learning.module.js';
import { ReportingModule } from './reporting/reporting.module.js';
import { WebhooksModule } from './webhooks/webhooks.module.js';
import { PrismaModule } from '../common/prisma.module.js';
import { TenantGuard } from '../common/tenant.guard.js';
import { AuditModule } from '../common/audit.module.js';
import configuration from '../common/configuration.js';
import { HealthController } from '../common/health.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true }
    }),
    PrismaModule,
    AuditModule,
    IdentityModule,
    DirectoryModule,
    PerformanceModule,
    LeaveModule,
    LearningModule,
    ReportingModule,
    WebhooksModule
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: TenantGuard }]
})
export class AppModule {}
