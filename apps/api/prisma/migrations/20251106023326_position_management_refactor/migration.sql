-- Position management refactor

-- Create new enum for configuration mode
CREATE TYPE "PositionManagementMode" AS ENUM ('EMPLOYEE_LED', 'POSITION_LED');

-- Extend role enum to include supervisor access for position management
ALTER TYPE "RoleKey" ADD VALUE IF NOT EXISTS 'SUPERVISOR';

-- Drop obsolete foreign keys before restructuring positions
ALTER TABLE "Position" DROP CONSTRAINT IF EXISTS "Position_orgUnitId_fkey";
ALTER TABLE "Position" DROP CONSTRAINT IF EXISTS "Position_reportsToId_fkey";

-- Remove legacy uniqueness constraint based on human readable ids
DROP INDEX IF EXISTS "Position_positionHumanId_key";

-- Prepare new structure columns on Position
ALTER TABLE "Position"
  ADD COLUMN "positionId" TEXT,
  ADD COLUMN "jobRoleId" TEXT,
  ADD COLUMN "locationId" TEXT,
  ADD COLUMN "parentPositionId" TEXT,
  ADD COLUMN "budgetedFte" DECIMAL(6,2),
  ADD COLUMN "budgetedSalary" DECIMAL(12,2),
  ADD COLUMN "headcount" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "inheritRoleData" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "createdById" TEXT,
  ADD COLUMN "updatedById" TEXT;

-- Backfill identifiers and hierarchy relationships
UPDATE "Position" SET "positionId" = "positionHumanId" WHERE "positionId" IS NULL;
UPDATE "Position" SET "parentPositionId" = "reportsToId" WHERE "parentPositionId" IS NULL;
UPDATE "Position" SET "createdById" = "createdByEmployeeId" WHERE "createdByEmployeeId" IS NOT NULL;

-- Carry forward budgeting values and status flags
UPDATE "Position"
SET "budgetedFte" = CASE WHEN "fte" IS NOT NULL THEN ROUND("fte"::numeric, 2) ELSE NULL END,
    "isActive" = CASE WHEN "status" = 'ARCHIVED' THEN false ELSE true END;

-- Map legacy free-text locations onto structured references where possible
UPDATE "Position" AS p
SET "locationId" = l."id"
FROM "Location" AS l
WHERE p."locationId" IS NULL
  AND p."tenantId" = l."tenantId"
  AND p."location" IS NOT NULL
  AND lower(l."name") = lower(p."location");

-- Fallback to the first known location per tenant when no direct match exists
UPDATE "Position" AS p
SET "locationId" = (
  SELECT l."id"
  FROM "Location" AS l
  WHERE l."tenantId" = p."tenantId"
  ORDER BY l."id"
  LIMIT 1
)
WHERE p."locationId" IS NULL;

-- Promote headcount defaults for existing rows
UPDATE "Position" SET "headcount" = COALESCE("headcount", 1);

-- Drop legacy columns that are superseded by the new position-led model
ALTER TABLE "Position"
  DROP COLUMN IF EXISTS "positionHumanId",
  DROP COLUMN IF EXISTS "orgUnitId",
  DROP COLUMN IF EXISTS "employmentType",
  DROP COLUMN IF EXISTS "workType",
  DROP COLUMN IF EXISTS "fte",
  DROP COLUMN IF EXISTS "location",
  DROP COLUMN IF EXISTS "reportsToId",
  DROP COLUMN IF EXISTS "budgetStatus",
  DROP COLUMN IF EXISTS "status",
  DROP COLUMN IF EXISTS "effectiveFrom",
  DROP COLUMN IF EXISTS "effectiveTo",
  DROP COLUMN IF EXISTS "justification",
  DROP COLUMN IF EXISTS "createdByEmployeeId",
  DROP COLUMN IF EXISTS "approvalsAudit";

-- Harden non-null requirements for new identifiers
ALTER TABLE "Position"
  ALTER COLUMN "positionId" SET NOT NULL,
  ALTER COLUMN "locationId" SET NOT NULL,
  ALTER COLUMN "headcount" SET DEFAULT 1,
  ALTER COLUMN "isActive" SET DEFAULT true,
  ALTER COLUMN "inheritRoleData" SET DEFAULT true;

-- Ensure unique position identifiers per tenant
CREATE UNIQUE INDEX "Position_tenantId_positionId_key" ON "Position"("tenantId", "positionId");

-- Create supporting table for reusable job role templates
CREATE TABLE "JobRole" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "skills" JSONB DEFAULT '[]'::jsonb,
    "goals" JSONB DEFAULT '[]'::jsonb,
    "courses" JSONB DEFAULT '[]'::jsonb,
    "competencies" JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);

-- Create assignment table capturing employee placement within positions
CREATE TABLE "UserPositionAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "fte" DECIMAL(6,2),
    "baseSalary" DECIMAL(12,2),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "reportsToOverrideId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserPositionAssignment_pkey" PRIMARY KEY ("id")
);

-- Create tenant level configuration for position management behaviour
CREATE TABLE "PositionManagementConfig" (
    "tenantId" TEXT NOT NULL,
    "mode" "PositionManagementMode" NOT NULL DEFAULT 'EMPLOYEE_LED',
    "showPositionIds" BOOLEAN NOT NULL DEFAULT true,
    "autoGeneratePositionIds" BOOLEAN NOT NULL DEFAULT true,
    "positionIdFormat" TEXT NOT NULL DEFAULT 'number',
    "idPrefix" TEXT NOT NULL DEFAULT 'POS',
    "startingNumber" INTEGER NOT NULL DEFAULT 10000,
    "nextSequenceNumber" INTEGER NOT NULL DEFAULT 10000,
    "enableBudgeting" BOOLEAN NOT NULL DEFAULT false,
    "enableConcurrentPositions" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PositionManagementConfig_pkey" PRIMARY KEY ("tenantId")
);

-- Indexes to support frequent assignment lookups
CREATE INDEX "UserPositionAssignment_tenant_employee_primary_idx"
  ON "UserPositionAssignment"("tenantId", "employeeId", "isPrimary");

-- Link new tables with referential integrity
ALTER TABLE "JobRole"
  ADD CONSTRAINT "JobRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Position"
  ADD CONSTRAINT "Position_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "JobRole"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "Position_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "Position_parentPositionId_fkey" FOREIGN KEY ("parentPositionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UserPositionAssignment"
  ADD CONSTRAINT "UserPositionAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "UserPositionAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "UserPositionAssignment_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "UserPositionAssignment_reportsToOverrideId_fkey" FOREIGN KEY ("reportsToOverrideId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PositionManagementConfig"
  ADD CONSTRAINT "PositionManagementConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Retire legacy approval workflow artefacts replaced by position assignments
DROP TABLE IF EXISTS "PositionApproval";
DROP TABLE IF EXISTS "ApprovalStep";
DROP TABLE IF EXISTS "PositionIdCounter";

-- Remove enums tied to the deprecated approval workflow model
DROP TYPE IF EXISTS "ApprovalAction";
DROP TYPE IF EXISTS "BudgetStatus";
DROP TYPE IF EXISTS "PositionStatus";
