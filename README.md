# WorkRight HRIS

WorkRight HRIS is a modern, multi-tenant HR platform tailored for Australian organisations. The system is designed around bounded contexts (Identity, Directory, Performance, Leave, Learning, Reporting) and showcases a modular architecture inspired by the best parts of SAP SuccessFactors while remaining open, extensible, and cloud-native.

## Highlights

- **Multi-tenancy with PostgreSQL row-level security** enforced across the API and Prisma layer.
- **Next.js App Router frontend** with shadcn/ui, React Query, Tailwind CSS, and tenant-aware theming.
- **NestJS API** exposing a versioned REST interface backed by Prisma and PostgreSQL.
- **Role-based access control** with policies for system owners, HR business partners, managers, employees, and auditors.
- **Workflows and automation** for leave approvals, performance reviews, and learning reminders using BullMQ and Redis.
- **Telemetry & compliance** baked in with OpenTelemetry, structured logging, audit trails, and Australian Privacy Principle considerations.

## Monorepo layout

```
.
├── apps
│   ├── api          # NestJS service with Prisma, OpenAPI, and BullMQ workers
│   └── web          # Next.js application with App Router
├── packages
│   ├── config       # Shared configuration (eslint, tailwind, feature flag helpers)
│   └── ui           # Shared UI primitives (shadcn/ui wrappers)
├── infra
│   └── terraform    # AWS Terraform modules and environments
├── scripts          # Database seed and utility scripts
└── docs             # Architecture decision records and product documentation
```

## Quick start

> Prerequisites: Node.js 20+, pnpm 8+, Docker, and Terraform.

```bash
pnpm install
pnpm run build
pnpm run test
```

To spin up the local stack:

```bash
docker-compose up --build
```

This will start PostgreSQL (with row-level security), Redis, Mailhog, the NestJS API, and Next.js web.

### Developer tooling

Run linting, type checks, and targeted builds from the repository root:

```bash
pnpm run lint
pnpm run typecheck
pnpm run build
```

Formatting is handled via Prettier:

```bash
pnpm run format
```

Run database migrations and seed demo tenants:

```bash
cd apps/api
pnpm prisma migrate deploy
pnpm prisma db seed
```

### Environment variables

Copy `.env.example` into each app and adjust as required.

- `DATABASE_URL` – Postgres connection string (RLS enabled)
- `REDIS_URL` – Redis for BullMQ queues
- `AUTH_SECRET` – Auth.js secret for JWT encryption
- `S3_BUCKET` – S3 bucket for attachments (MinIO locally)
- `NEXT_PUBLIC_API_URL` – Base URL for the API

> All authenticated API requests require an `X-Tenant-Id` header to enforce row-level security. Tenant provisioning via `POST /v1/identity/tenants` is the only public endpoint.

### Demo script

1. Create a tenant via `POST /v1/identity/tenants` and configure branding and leave settings.
2. Import employees using the CSV importer or `POST /v1/directory/employees/import`.
3. Cascade goals through the Goals board, launch a review cycle, and collect 360 feedback.
4. Submit a leave request, approve it as a manager, and observe calendar sync via ICS.
5. Generate a headcount report and schedule a webhook to a test endpoint.

## Architecture diagram

```
         ┌────────────────┐          ┌──────────────┐
         │    Next.js     │◄────────►│  API Gateway  │◄────────┐
         │ (apps/web)     │          │  (NestJS)     │         │
         └──────┬─────────┘          └─────┬────────┘         │
                │                         ┌─▼──────────┐      │
                │                         │  Services   │      │
                │                         │(modules w/  │      │
                │                         │ RLS + RBAC) │      │
                │                         └─┬────┬─────┘      │
                │                           │    │            │
                │                      ┌────▼┐ ┌─▼─────────┐ │
                │                      │Postg│ │   Redis    │ │
                │                      │ RLS │ │  BullMQ    │ │
                │                      └────┘ └────────────┘ │
                │                            ┌───────────────▼─────┐
                │                            │ S3-compatible storage│
                │                            └──────────────────────┘
                │
         ┌──────▼─────────┐
         │ Observability  │ (OpenTelemetry, pino, feature flags)
         └────────────────┘
```

## Deployment

- **Containerisation** via Dockerfiles for web and API services.
- **Infrastructure as code** with Terraform provisioning AWS VPC, RDS (PostgreSQL 15 with RLS), ECS/Fargate services, Redis (Elasticache), S3, CloudFront, and ACM certificates.
- **CI/CD** pipelines on GitHub Actions for linting, testing, Prisma migrations, and deployment with manual approvals for production.

## Testing strategy

- Unit tests with Vitest/Jest inside packages and apps.
- API tests via Supertest.
- Component tests with React Testing Library.
- Playwright E2E covering critical flows (tenant setup, reviews, leave approvals).

## Localisation & accessibility

All UI copy is Australian English. Date formatting uses `dd/MM/yyyy`, currency is AUD, and accessibility meets WCAG 2.2 AA with keyboard navigation, semantic landmarks, and actionable validation messages.

