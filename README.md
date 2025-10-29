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

## Step-by-step local testing guide

1. **Confirm prerequisites.** Install Node.js 20 or newer, pnpm 8+, Docker Desktop (or Docker Engine + Compose v2), and Terraform. Authenticate to any private registries or package feeds before proceeding.
2. **Install workspace dependencies.** From the repository root run:

   ```bash
   pnpm install
   ```

   This bootstraps the pnpm workspaces (`apps/*` and `packages/*`).
3. **Configure environment variables.** The postinstall script copies each `.env.example` to `.env` within `apps/api` and `apps/web` when missing, so you only need to update the generated files with secrets (Postgres, Redis, Auth.js secret, S3 bucket, API URL). The API enforces the `X-Tenant-Id` header for every authenticated request.
4. **Bring services online.** Choose one of the following approaches:
   - **Docker Compose (recommended for parity).**

     ```bash
     docker-compose up --build
     ```

     Compose provisions PostgreSQL with row-level security, Redis for BullMQ, Mailhog, the NestJS API, and the Next.js frontend.
    It reads environment variables from `apps/api/.env` and `apps/web/.env`; the postinstall script creates them from the bundled `.env.example` files on first install.
   - **Local processes (advanced).** Run `pnpm --filter api run start:dev` and `pnpm --filter web dev` in separate terminals after starting Postgres/Redis manually.
5. **Apply database migrations and seed demo tenants.** With the API dependencies running:

   ```bash
   cd apps/api
   pnpm prisma migrate deploy
   pnpm prisma db seed
   cd ../..
   ```

   This creates the `acme` and `demo` tenants and sample Australian data (dates in `dd/MM/yyyy`).
6. **Execute the automated test suites.** From the repo root run:

   ```bash
   pnpm run build
   pnpm run test
   ```

   These commands compile the workspaces and execute the aggregated Jest/Vitest/Playwright entrypoints. For faster feedback you can run targeted checks:

   ```bash
   pnpm run lint
   pnpm run typecheck
   pnpm run format
   ```
7. **Walk through the demo workflow.** Follow `scripts/demo-flow.md` to exercise tenant provisioning, goal alignment, leave approvals, learning assignments, and reporting end-to-end. Validate audit logs and webhook deliveries as you progress.

### Developer tooling

For day-to-day development, the following scripts are available from the repository root:

- `pnpm run lint` – ESLint across all workspaces.
- `pnpm run typecheck` – TypeScript project references via `tsc --build`.
- `pnpm run build` – Production builds for the API, web app, and shared packages.
- `pnpm run format` – Prettier check/format.

Individual packages expose additional scripts (for example, `pnpm --filter api test:e2e`), and Vitest/Playwright configs live alongside each app for focused runs.

### Environment variables

Copy `.env.example` into each app and adjust as required. For the API workspace this ensures Prisma can read `DATABASE_URL` when running migrations:

```bash
cp apps/api/.env.example apps/api/.env
```

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

### Building and pushing the API Docker image

Use the production `Dockerfile` in the repository root to create the API image that Azure App Service (or any other container runtime) consumes. The lockfile is now included in the build context, so the image is pinned to the workspace dependency graph.

The high-level workflow is:

1. Authenticate to your registry (Azure Container Registry in this example):

   ```bash
   az acr login --name <acr-name>
   ```

2. Build the API image from the monorepo root, tagging it for the `workright/api` repository within your registry:

   ```bash
   docker build -t <acr-name>.azurecr.io/workright/api:<tag> .
   ```

   The build runs `pnpm install --frozen-lockfile`, compiles the shared packages, generates Prisma client code, and prunes development-only dependencies before the runtime image is assembled.

3. Push the image so the deployment script (or Azure App Service) can pull it:

   ```bash
   docker push <acr-name>.azurecr.io/workright/api:<tag>
   ```

For a more detailed walkthrough—including troubleshooting tips for air-gapped environments—see [`docs/docker/api-image.md`](docs/docker/api-image.md).

## Testing strategy

- Unit tests with Vitest/Jest inside packages and apps.
- API tests via Supertest.
- Component tests with React Testing Library.
- Playwright E2E covering critical flows (tenant setup, reviews, leave approvals).

## Localisation & accessibility

All UI copy is Australian English. Date formatting uses `dd/MM/yyyy`, currency is AUD, and accessibility meets WCAG 2.2 AA with keyboard navigation, semantic landmarks, and actionable validation messages.

