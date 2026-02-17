-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'consultant', 'reviewer', 'client_readonly');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "industry" TEXT,
    "logoUrl" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlCatalog" (
    "id" TEXT NOT NULL,
    "frameworkVersion" TEXT NOT NULL,
    "methodologyVersion" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "articleRef" TEXT NOT NULL,
    "legalReference" TEXT NOT NULL,
    "evidenceRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ControlCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditSnapshot" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "frameworkVersion" TEXT NOT NULL,
    "methodologyVersion" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditSnapshot_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "organizationId" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING ("role"::"UserRole");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'consultant';

-- AlterTable
ALTER TABLE "Audit"
    ADD COLUMN "clientId" TEXT,
    ADD COLUMN "frameworkVersion" TEXT NOT NULL DEFAULT 'nis2-2026-v1',
    ADD COLUMN "isLocked" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "lockedAt" TIMESTAMP(3),
    ADD COLUMN "methodologyVersion" TEXT NOT NULL DEFAULT 'methodology-v1',
    ADD COLUMN "organizationId" TEXT,
    ADD COLUMN "overallScore" INTEGER,
    ADD COLUMN "riskLevel" "RiskLevel";

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Client_organizationId_name_idx" ON "Client"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ControlCatalog_frameworkVersion_questionId_key" ON "ControlCatalog"("frameworkVersion", "questionId");

-- CreateIndex
CREATE INDEX "ControlCatalog_frameworkVersion_categoryId_idx" ON "ControlCatalog"("frameworkVersion", "categoryId");

-- CreateIndex
CREATE INDEX "AuditSnapshot_auditId_createdAt_idx" ON "AuditSnapshot"("auditId", "createdAt");

-- CreateIndex
CREATE INDEX "Audit_frameworkVersion_idx" ON "Audit"("frameworkVersion");

-- CreateIndex
CREATE INDEX "Audit_organizationId_clientId_idx" ON "Audit"("organizationId", "clientId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditSnapshot" ADD CONSTRAINT "AuditSnapshot_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
