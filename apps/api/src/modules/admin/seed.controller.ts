import { Controller, Post } from '@nestjs/common';
import { Prisma, PositionManagementMode } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service.js';

@Controller('admin')
export class SeedController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('seed-mining')
  async seed() {
    try {
      const tenant = await this.prisma.tenant.upsert({
        where: { slug: 'demo' },
        update: {},
        create: ({ id: 'tenant-demo', slug: 'demo', name: 'Demo Mining AU', settings: {} } as any)
      });

      const [camp, perthHq] = await Promise.all([
        this.prisma.location.upsert({
          where: { id: 'loc-karratha' },
          update: {},
          create: ({
            id: 'loc-karratha',
            tenantId: tenant.id,
            name: 'Karratha Camp',
            state: 'WA',
            country: 'Australia',
            timezone: 'Australia/Perth'
          } as any)
        }),
        this.prisma.location.upsert({
          where: { id: 'loc-perth-hq' },
          update: {},
          create: ({
            id: 'loc-perth-hq',
            tenantId: tenant.id,
            name: 'Perth HQ',
            state: 'WA',
            country: 'Australia',
            timezone: 'Australia/Perth'
          } as any)
        })
      ]);

      const [deptCom, deptOps] = await Promise.all([
        (this.prisma as any).department.upsert({
          where: { id: 'dept-com' },
          update: {},
          create: ({ id: 'dept-com', tenantId: tenant.id, name: 'Commercial', codePrefix: 'COM', status: 'ACTIVE' } as any)
        }),
        (this.prisma as any).department.upsert({
          where: { id: 'dept-ops' },
          update: {},
          create: ({ id: 'dept-ops', tenantId: tenant.id, name: 'Operations', codePrefix: 'OPS', status: 'ACTIVE' } as any)
        })
      ]);

      await this.prisma.positionManagementConfig.upsert({
        where: { tenantId: tenant.id },
        update: ({
          mode: PositionManagementMode.POSITION_LED,
          autoGeneratePositionIds: true,
          positionIdFormat: 'prefix',
          idPrefix: 'OPS',
          startingNumber: 32000,
          nextSequenceNumber: 32010,
          enableBudgeting: true,
          enableConcurrentPositions: true
        } as any),
        create: ({
          tenantId: tenant.id,
          mode: PositionManagementMode.POSITION_LED,
          showPositionIds: true,
          autoGeneratePositionIds: true,
          positionIdFormat: 'prefix',
          idPrefix: 'OPS',
          startingNumber: 32000,
          nextSequenceNumber: 32010,
          enableBudgeting: true,
          enableConcurrentPositions: true
        } as any)
      });

      const [opsRole, commRole, hrRole] = await Promise.all([
        this.prisma.jobRole.upsert({
          where: { id: 'role-ops-super' },
          update: {},
          create: ({
            id: 'role-ops-super',
            tenantId: tenant.id,
            title: 'Operations Superintendent',
            description: 'Leads the end-to-end production team for the Karratha site.',
            skills: ['Leadership', 'Production planning'] as any,
            goals: ['Maintain 95% production availability'] as any,
            courses: ['leadership-101', 'ops-risk'] as any,
            competencies: ['Strategic Thinking', 'Safety Stewardship'] as any
          } as any)
        }),
        this.prisma.jobRole.upsert({
          where: { id: 'role-commercial-manager' },
          update: {},
          create: ({
            id: 'role-commercial-manager',
            tenantId: tenant.id,
            title: 'Commercial Manager',
            description: 'Owns site budgeting, capital projects and vendor strategy.',
            skills: ['Capital allocation', 'Contract negotiation'] as any,
            goals: ['Deliver quarterly cost variance < 2%'] as any,
            courses: ['commercial-acumen'] as any,
            competencies: ['Financial Acumen', 'Business Partnering'] as any
          } as any)
        }),
        this.prisma.jobRole.upsert({
          where: { id: 'role-hr-advisor' },
          update: {},
          create: ({
            id: 'role-hr-advisor',
            tenantId: tenant.id,
            title: 'HR Advisor',
            description: 'Coordinates onboarding, learning and employee relations for site.',
            skills: ['Employee relations', 'Onboarding'] as any,
            goals: ['Reduce time-to-fill to 30 days'] as any,
            courses: ['hr-essentials'] as any,
            competencies: ['Stakeholder Management', 'Coaching'] as any
          } as any)
        })
      ]);

      const superintendent = await this.prisma.position.upsert({
        where: { id: 'pos-demo-superintendent' },
        update: {},
        create: ({
          id: 'pos-demo-superintendent',
          tenantId: tenant.id,
          positionId: 'OPS-32000',
          title: 'Operations Superintendent',
          jobRoleId: opsRole.id,
          departmentId: deptOps.id,
          locationId: camp.id,
          headcount: 1,
          budgetedFte: new Prisma.Decimal(1),
          budgetedSalary: new Prisma.Decimal(235000),
          inheritRoleData: true,
          isActive: true
        } as any)
      });

      const shiftSupervisor = await this.prisma.position.upsert({
        where: { id: 'pos-demo-shift-supervisor' },
        update: {},
        create: ({
          id: 'pos-demo-shift-supervisor',
          tenantId: tenant.id,
          positionId: 'OPS-32001',
          title: 'Shift Supervisor',
          jobRoleId: opsRole.id,
          departmentId: deptOps.id,
          locationId: camp.id,
          parentPositionId: superintendent.id,
          headcount: 2,
          budgetedFte: new Prisma.Decimal(2),
          budgetedSalary: new Prisma.Decimal(360000),
          inheritRoleData: true,
          isActive: true
        } as any)
      });

      const commercialManager = await this.prisma.position.upsert({
        where: { id: 'pos-demo-commercial-manager' },
        update: {},
        create: ({
          id: 'pos-demo-commercial-manager',
          tenantId: tenant.id,
          positionId: 'COM-32002',
          title: 'Commercial Manager',
          jobRoleId: commRole.id,
          departmentId: deptCom.id,
          locationId: perthHq.id,
          headcount: 1,
          budgetedFte: new Prisma.Decimal(1),
          budgetedSalary: new Prisma.Decimal(210000),
          inheritRoleData: true,
          isActive: true
        } as any)
      });

      const hrAdvisor = await this.prisma.position.upsert({
        where: { id: 'pos-demo-hr-advisor' },
        update: {},
        create: ({
          id: 'pos-demo-hr-advisor',
          tenantId: tenant.id,
          positionId: 'PPL-32003',
          title: 'HR Advisor',
          jobRoleId: hrRole.id,
          departmentId: deptCom.id,
          locationId: perthHq.id,
          parentPositionId: commercialManager.id,
          headcount: 1,
          budgetedFte: new Prisma.Decimal(1),
          budgetedSalary: new Prisma.Decimal(150000),
          inheritRoleData: true,
          isActive: true
        } as any)
      });

      const superintendentEmployee = await this.prisma.employee.upsert({
        where: { id: 'emp-demo-superintendent' },
        update: ({ departmentId: deptOps.id, locationId: camp.id, positionId: superintendent.id } as any),
        create: ({
          id: 'emp-demo-superintendent',
          tenantId: tenant.id,
          givenName: 'Morgan',
          familyName: 'Marshall',
          preferredName: 'Morgan',
          email: 'morgan.marshall@demo.example.au',
          startDate: new Date('2024-01-08'),
          jobTitle: 'Operations Superintendent',
          departmentId: deptOps.id,
          locationId: camp.id,
          positionId: superintendent.id
        } as any)
      });

      const shiftLeadEmployee = await this.prisma.employee.upsert({
        where: { id: 'emp-demo-shift-lead' },
        update: ({ managerId: superintendentEmployee.id, departmentId: deptOps.id, locationId: camp.id, positionId: shiftSupervisor.id } as any),
        create: ({
          id: 'emp-demo-shift-lead',
          tenantId: tenant.id,
          givenName: 'Sienna',
          familyName: 'Surveyor',
          preferredName: 'Sienna',
          email: 'sienna.surveyor@demo.example.au',
          startDate: new Date('2024-03-01'),
          jobTitle: 'Shift Supervisor',
          managerId: superintendentEmployee.id,
          departmentId: deptOps.id,
          locationId: camp.id,
          positionId: shiftSupervisor.id
        } as any)
      });

      const hrAdvisorEmployee = await this.prisma.employee.upsert({
        where: { id: 'emp-demo-hr-advisor' },
        update: ({ managerId: superintendentEmployee.id, departmentId: deptCom.id, locationId: perthHq.id, positionId: hrAdvisor.id } as any),
        create: ({
          id: 'emp-demo-hr-advisor',
          tenantId: tenant.id,
          givenName: 'Noah',
          familyName: 'Navigator',
          preferredName: 'Noah',
          email: 'noah.navigator@demo.example.au',
          startDate: new Date('2024-05-06'),
          jobTitle: 'HR Advisor',
          managerId: superintendentEmployee.id,
          departmentId: deptCom.id,
          locationId: perthHq.id,
          positionId: hrAdvisor.id
        } as any)
      });

      await Promise.all([
        this.prisma.userPositionAssignment.upsert({
          where: { id: 'upa-demo-superintendent' },
          update: ({
            fte: new Prisma.Decimal(1),
            baseSalary: new Prisma.Decimal(235000),
            startDate: new Date('2024-01-08'),
            endDate: null,
            isPrimary: true
          } as any),
          create: ({
            id: 'upa-demo-superintendent',
            tenantId: tenant.id,
            employeeId: superintendentEmployee.id,
            positionId: superintendent.id,
            fte: new Prisma.Decimal(1),
            baseSalary: new Prisma.Decimal(235000),
            startDate: new Date('2024-01-08'),
            isPrimary: true
          } as any)
        }),
        this.prisma.userPositionAssignment.upsert({
          where: { id: 'upa-demo-shift-lead' },
          update: ({
            fte: new Prisma.Decimal(1),
            baseSalary: new Prisma.Decimal(165000),
            startDate: new Date('2024-03-01'),
            endDate: null,
            isPrimary: true
          } as any),
          create: ({
            id: 'upa-demo-shift-lead',
            tenantId: tenant.id,
            employeeId: shiftLeadEmployee.id,
            positionId: shiftSupervisor.id,
            fte: new Prisma.Decimal(1),
            baseSalary: new Prisma.Decimal(165000),
            startDate: new Date('2024-03-01'),
            isPrimary: true
          } as any)
        }),
        this.prisma.userPositionAssignment.upsert({
          where: { id: 'upa-demo-hr-advisor' },
          update: ({
            fte: new Prisma.Decimal(1),
            baseSalary: new Prisma.Decimal(135000),
            startDate: new Date('2024-05-06'),
            endDate: null,
            isPrimary: true,
            reportsToOverrideId: superintendentEmployee.id
          } as any),
          create: ({
            id: 'upa-demo-hr-advisor',
            tenantId: tenant.id,
            employeeId: hrAdvisorEmployee.id,
            positionId: hrAdvisor.id,
            fte: new Prisma.Decimal(1),
            baseSalary: new Prisma.Decimal(135000),
            startDate: new Date('2024-05-06'),
            isPrimary: true,
            reportsToOverrideId: superintendentEmployee.id
          } as any)
        })
      ]);

      const rosterTemplate = await this.prisma.rosterTemplate.upsert({
        where: { id: 'tmpl-8-6' },
        update: {},
        create: ({
          id: 'tmpl-8-6',
          tenantId: tenant.id,
          name: '8/6 Day Shifts',
          seedDate: new Date('2024-11-04'),
          pattern: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'R', 'R', 'R', 'R', 'R', 'R']
        } as any)
      });

      await this.prisma.rosterAssignment.upsert({
        where: { id: 'asn-demo-shift-lead' },
        update: {},
        create: ({
          id: 'asn-demo-shift-lead',
          tenantId: tenant.id,
          templateId: rosterTemplate.id,
          employeeId: shiftLeadEmployee.id,
          locationId: camp.id,
          effectiveFrom: new Date('2024-11-04')
        } as any)
      });

      const requisition = await (this.prisma as any).requisition.upsert({
        where: { id: 'req-demo-shift-supervisor' },
        update: ({ positionId: shiftSupervisor.id } as any),
        create: ({
          id: 'req-demo-shift-supervisor',
          tenantId: tenant.id,
          positionId: shiftSupervisor.id,
          title: 'Shift Supervisor - Karratha',
          employmentType: 'Full-time',
          workType: 'Permanent',
          vacancyCount: 1,
          location: 'Karratha, WA',
          description: 'Lead a production shift safely and efficiently at our Karratha site.',
          selectionCriteria: ['Supervision experience', 'Safety leadership', 'FIFO readiness']
        } as any)
      });

      await (this.prisma as any).jobPosting.upsert({
        where: { externalSlug: 'shift-supervisor-karratha' },
        update: {},
        create: ({
          requisitionId: requisition.id,
          tenantId: tenant.id,
          externalSlug: 'shift-supervisor-karratha',
          visibility: 'public',
          channels: ['website'],
          status: 'active'
        } as any)
      });

      await (this.prisma as any).rejectionReason.upsert({
        where: { code: 'NOT_SHORTLISTED' },
        update: {},
        create: ({ code: 'NOT_SHORTLISTED', label: 'Not shortlisted', visibleToCandidate: false } as any)
      });
      await (this.prisma as any).rejectionReason.upsert({
        where: { code: 'INTERVIEW_OUTCOME' },
        update: {},
        create: ({ code: 'INTERVIEW_OUTCOME', label: 'Interview outcome', visibleToCandidate: false } as any)
      });
      await (this.prisma as any).rejectionReason.upsert({
        where: { code: 'ROLE_WITHDRAWN' },
        update: {},
        create: ({ code: 'ROLE_WITHDRAWN', label: 'Role withdrawn', visibleToCandidate: false } as any)
      });

      return {
        ok: true,
        tenantId: tenant.id,
        locations: [camp.id, perthHq.id],
        positions: [superintendent.positionId, shiftSupervisor.positionId, commercialManager.positionId, hrAdvisor.positionId]
      } as any;
    } catch (e: any) {
      // Surface error for debugging in dev; respond with details
      // eslint-disable-next-line no-console
      console.error('Seed error', e);
      return { ok: false, error: String(e?.message ?? e), stack: String(e?.stack ?? '') } as any;
    }
  }
}
