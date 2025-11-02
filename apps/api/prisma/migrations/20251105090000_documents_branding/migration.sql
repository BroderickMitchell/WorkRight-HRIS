-- AlterTable
ALTER TABLE "DocumentTemplate"
  ADD COLUMN "category" TEXT NOT NULL DEFAULT 'HR',
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "placeholders" JSONB;

-- CreateTable
CREATE TABLE "DocumentTemplateRevision" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "placeholders" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentTemplateRevision_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "GeneratedDocument"
  ADD COLUMN "data" JSONB,
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN "signed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "signedAt" TIMESTAMP(3),
  ADD COLUMN "signedBy" TEXT;

-- AlterTable
ALTER TABLE "Tenant"
  ADD COLUMN "supportEmail" VARCHAR(255),
  ADD COLUMN "address" TEXT,
  ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Australia/Sydney',
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'AUD';

-- CreateIndex
CREATE INDEX "DocumentTemplate_tenantId_category_idx" ON "DocumentTemplate"("tenantId", "category");

-- CreateIndex
CREATE INDEX "DocumentTemplateRevision_tenantId_templateId_idx" ON "DocumentTemplateRevision"("tenantId", "templateId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentTemplateRevision_templateId_version_key" ON "DocumentTemplateRevision"("templateId", "version");

-- AddForeignKey
ALTER TABLE "DocumentTemplateRevision" ADD CONSTRAINT "DocumentTemplateRevision_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplateRevision" ADD CONSTRAINT "DocumentTemplateRevision_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
