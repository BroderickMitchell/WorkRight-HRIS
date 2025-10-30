# Repository instructions

## General workflow
- Use **pnpm 8+** for all workspace commands; avoid `npm` or `yarn` so lockfile stays in sync.
- Run `pnpm install` before other tasks to ensure the workspace and postinstall env bootstrap succeed.
- Keep `.env` files updated via `pnpm bootstrap:env` when new environment variables are introduced; document any additions in the relevant README.

## Code quality expectations
- Match the existing TypeScript-first stack (NestJS in `apps/api`, Next.js App Router in `apps/web`, shared packages under `packages/`).
- Prefer existing utilities from `packages/config` and `packages/ui` instead of duplicating configuration or UI primitives.
- Enforce formatting with `pnpm run format` (Prettier) and lint/type-check via `pnpm run lint` and `pnpm run typecheck` before opening a PR.
- Add or update automated tests alongside code changes using the local package scripts (for example, `pnpm --filter api test` or `pnpm --filter web test`).
- Maintain Prisma schema migrations in `apps/api/prisma`; whenever the schema changes, generate and check in the corresponding migration plus update seed data if required.

## Application conventions
- API endpoints must respect multi-tenancy: ensure every new handler validates the `X-Tenant-Id` header and scopes database access accordingly.
- Follow NestJS module boundaries; place controllers/services/providers inside the appropriate bounded-context module (Identity, Directory, Performance, Leave, Learning, Reporting).
- Frontend components should leverage shadcn/ui wrappers from `packages/ui`, React Query for data fetching, and keep tenant-aware theming intact.
- Use structured logging (pino/OpenTelemetry) hooks already configured; avoid introducing alternative logging systems.

## Testing & tooling
- Validate builds with `pnpm run build`; for quicker cycles use the filtered package scripts (e.g., `pnpm --filter web build`).
- Execute end-to-end or workflow scripts documented in `scripts/` when modifying cross-cutting behavior (leave approvals, performance cycles, etc.).
- Docker-based development is the default: `docker-compose up --build` should remain functional after your changes.

## Documentation & infrastructure
- Update `docs/` and relevant ADRs when altering architecture decisions or workflows.
- For infrastructure or Terraform changes under `infra/`, ensure plans stay idempotent and document any new AWS resources or IAM requirements.

