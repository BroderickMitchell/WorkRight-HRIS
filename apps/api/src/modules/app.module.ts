import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { IdentityModule } from './identity/identity.module.js';
import { DirectoryModule } from './directory/directory.module.js';
import { PerformanceModule } from './performance/performance.module.js';
import { LeaveModule } from './leave/leave.module.js';
import { LearningModule } from './learning/learning.module.js';
import { ReportingModule } from './reporting/reporting.module.js';
import { WebhooksModule } from './webhooks/webhooks.module.js';
import { RostersModule } from './rosters/rosters.module.js';
import { TravelModule } from './travel/travel.module.js';
import { AdminModule } from './admin/admin.module.js';
import { PayrollModule } from './payroll/payroll.module.js';
import { PositionsModule } from './positions/positions.module.js';
import { OrganizationModule } from './organization/organization.module.js';
import { RecruitmentModule } from './recruitment/recruitment.module.js';
import { AuditLogModule } from './auditlog/auditlog.module.js';
import { EmployeeProfileModule } from './employee-profile/employee-profile.module.js';
import { PrismaModule } from '../common/prisma.module.js';
import { TenantGuard } from '../common/tenant.guard.js';
import { RolesGuard } from '../common/auth/roles.guard.js';
import { AuditModule } from '../common/audit.module.js';
import { AuthModule } from '../common/auth/auth.module.js';
import configuration from '../common/configuration.js';
import { HealthController } from '../common/health.controller.js';
import { RedactionInterceptor } from '../common/security/redaction.interceptor.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true }
    }),
    PrismaModule,
    AuditModule,
    AuthModule,
    IdentityModule,
    DirectoryModule,
    PerformanceModule,
    LeaveModule,
    LearningModule,
    ReportingModule,
    WebhooksModule,
    RostersModule,
    TravelModule,
    AdminModule,
    PayrollModule,
    PositionsModule,
    OrganizationModule,
    RecruitmentModule,
    AuditLogModule,
    EmployeeProfileModule
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: TenantGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: RedactionInterceptor }
  ]
})
export class AppModule {}
