# ADR 0001 – Multi-tenancy strategy

## Status
Accepted – April 2024

## Context
WorkRight HRIS must support multiple Australian organisations with strict isolation requirements. We evaluated two main options:

1. **Schema-per-tenant** using PostgreSQL schemas for each customer. Pros: strong isolation, easier data export. Cons: more complex migrations, difficult to scale to hundreds of tenants without orchestration.
2. **Row-level security (RLS)** using a shared schema with tenant identifiers and database-enforced policies. Pros: simplified migrations, efficient use of connection pools, well-supported by Prisma via middleware, aligns with analytics/reporting needs. Cons: requires rigorous policy coverage and application awareness.

## Decision
Adopt **row-level security** on a shared schema.

- Every multi-tenant table includes a `tenantId` column.
- PostgreSQL RLS policies enforce `current_setting('app.tenant_id')` to match the row value.
- Prisma middleware ensures the tenant scope is injected on every query, and the NestJS `TenantGuard` sets the ambient context.
- Audit events capture actor, IP, and tenant to support Australian Privacy Principles.

## Consequences
- Database migrations remain single-run per deployment, simplifying CI/CD.
- Background jobs must set the tenant context before accessing data.
- Requires bootstrapping of `SET app.tenant_id` per connection (handled in Prisma `$use`).
- Facilitates cross-tenant analytics while preserving isolation when using materialised views or the reporting warehouse.
