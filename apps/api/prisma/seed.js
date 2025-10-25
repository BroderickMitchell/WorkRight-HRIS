"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.$transaction([
        prisma.auditEvent.deleteMany({}),
        prisma.webhookDelivery.deleteMany({}),
        prisma.webhookEndpoint.deleteMany({}),
        prisma.notification.deleteMany({}),
        prisma.leaveApproval.deleteMany({}),
        prisma.leaveRequest.deleteMany({}),
        prisma.leaveBalance.deleteMany({}),
        prisma.leavePolicy.deleteMany({}),
        prisma.feedback.deleteMany({}),
        prisma.review.deleteMany({}),
        prisma.reviewParticipant.deleteMany({}),
        prisma.reviewCycle.deleteMany({}),
        prisma.goalAlignment.deleteMany({}),
        prisma.progressUpdate.deleteMany({}),
        prisma.goal.deleteMany({}),
        prisma.employment.deleteMany({}),
        prisma.employee.deleteMany({}),
        prisma.position.deleteMany({}),
        prisma.department.deleteMany({}),
        prisma.completion.deleteMany({}),
        prisma.enrolment.deleteMany({}),
        prisma.module.deleteMany({}),
        prisma.course.deleteMany({}),
        prisma.holiday.deleteMany({}),
        prisma.location.deleteMany({}),
        prisma.user.deleteMany({}),
        prisma.tenant.deleteMany({})
    ]);
    const tenants = await prisma.tenant.createMany({
        data: [
            {
                id: 'tenant-acme',
                name: 'Acme Mining Co',
                slug: 'acme',
                settings: { brandingPrimaryColor: '#00695c', payCycle: 'fortnightly' }
            },
            {
                id: 'tenant-demo',
                name: 'Demo Health AU',
                slug: 'demo',
                settings: { brandingPrimaryColor: '#512da8', payCycle: 'monthly' }
            }
        ]
    });
    console.log(`Seeded ${tenants.count} tenants`);
    const [acme, demo] = await Promise.all([
        prisma.tenant.findUnique({ where: { slug: 'acme' } }),
        prisma.tenant.findUnique({ where: { slug: 'demo' } })
    ]);
    if (!acme || !demo)
        throw new Error('Tenants missing after seed');
    await prisma.user.createMany({
        data: [
            {
                tenantId: acme.id,
                email: 'owner@acme.example.au',
                givenName: 'Olivia',
                familyName: 'Owner',
                roles: [client_1.RoleKey.SYSTEM_OWNER, client_1.RoleKey.HR_BUSINESS_PARTNER]
            },
            {
                tenantId: acme.id,
                email: 'manager@acme.example.au',
                givenName: 'Mason',
                familyName: 'Manager',
                roles: [client_1.RoleKey.MANAGER]
            },
            {
                tenantId: demo.id,
                email: 'hr@demo.example.au',
                givenName: 'Hannah',
                familyName: 'HR',
                roles: [client_1.RoleKey.HR_BUSINESS_PARTNER]
            }
        ]
    });
    await prisma.department.createMany({
        data: [
            { tenantId: acme.id, name: 'Operations' },
            { tenantId: acme.id, name: 'People & Culture' },
            { tenantId: demo.id, name: 'Clinicians' }
        ]
    });
    const operations = await prisma.department.findFirst({ where: { tenantId: acme.id, name: 'Operations' } });
    const pnc = await prisma.department.findFirst({ where: { tenantId: acme.id, name: 'People & Culture' } });
    const superintendent = await prisma.position.create({
        data: {
            tenantId: acme.id,
            title: 'Superintendent',
            departmentId: operations?.id
        }
    });
    const hrAdvisor = await prisma.position.create({
        data: {
            tenantId: acme.id,
            title: 'HR Advisor',
            departmentId: pnc?.id
        }
    });
    const manager = await prisma.employee.create({
        data: {
            tenantId: acme.id,
            givenName: 'Mason',
            familyName: 'Manager',
            email: 'manager@acme.example.au',
            startDate: (0, date_fns_1.addDays)(new Date(), -400),
            positionId: superintendent.id
        }
    });
    await prisma.employee.createMany({
        data: [
            {
                tenantId: acme.id,
                givenName: 'Sienna',
                familyName: 'Surveyor',
                email: 'sienna.surveyor@acme.example.au',
                startDate: (0, date_fns_1.addDays)(new Date(), -120),
                managerId: manager.id,
                positionId: superintendent.id
            },
            {
                tenantId: acme.id,
                givenName: 'Noah',
                familyName: 'Navigator',
                email: 'noah.navigator@acme.example.au',
                startDate: (0, date_fns_1.addDays)(new Date(), -90),
                managerId: manager.id,
                positionId: hrAdvisor.id
            }
        ]
    });
    await prisma.goal.create({
        data: {
            tenantId: acme.id,
            title: 'Reduce safety incidents by 20%',
            dueDate: (0, date_fns_1.addDays)(new Date(), 180),
            weighting: 0.3,
            owner: { connect: { email_tenantId: { email: 'manager@acme.example.au', tenantId: acme.id } } }
        }
    });
    await prisma.leavePolicy.create({
        data: {
            tenantId: acme.id,
            name: 'Annual Leave',
            code: 'AL',
            accrualRule: { perMonth: 2.92 },
            maxBalance: 228
        }
    });
    console.log('Seeded demo data');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
