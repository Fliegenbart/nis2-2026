-- CreateEnum
CREATE TYPE "ActionPriority" AS ENUM ('critical', 'high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('open', 'in_progress', 'blocked', 'done');

-- CreateEnum
CREATE TYPE "FindingStatus" AS ENUM ('draft', 'in_review', 'approved', 'closed');

-- CreateEnum
CREATE TYPE "FindingSeverity" AS ENUM ('critical', 'high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "FindingCommentRole" AS ENUM ('consultant', 'reviewer', 'client');

-- AlterTable
ALTER TABLE "ActionItem" ADD COLUMN "ownerName" TEXT;
ALTER TABLE "ActionItem" ADD COLUMN "ownerEmail" TEXT;
ALTER TABLE "ActionItem" ADD COLUMN "ownerUserId" TEXT;
ALTER TABLE "ActionItem" ADD COLUMN "findingId" TEXT;

-- AlterTable
ALTER TABLE "ActionItem" ALTER COLUMN "priority" DROP DEFAULT;
ALTER TABLE "ActionItem"
  ALTER COLUMN "priority" TYPE "ActionPriority"
  USING (
    CASE
      WHEN "priority" = 'critical' THEN 'critical'::"ActionPriority"
      WHEN "priority" = 'high' THEN 'high'::"ActionPriority"
      WHEN "priority" = 'low' THEN 'low'::"ActionPriority"
      ELSE 'medium'::"ActionPriority"
    END
  );
ALTER TABLE "ActionItem" ALTER COLUMN "priority" SET DEFAULT 'medium';

-- AlterTable
ALTER TABLE "ActionItem" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ActionItem"
  ALTER COLUMN "status" TYPE "ActionStatus"
  USING (
    CASE
      WHEN "status" = 'done' THEN 'done'::"ActionStatus"
      WHEN "status" = 'in_progress' THEN 'in_progress'::"ActionStatus"
      WHEN "status" = 'blocked' THEN 'blocked'::"ActionStatus"
      ELSE 'open'::"ActionStatus"
    END
  );
ALTER TABLE "ActionItem" ALTER COLUMN "status" SET DEFAULT 'open';

-- CreateTable
CREATE TABLE "Finding" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "FindingSeverity" NOT NULL DEFAULT 'medium',
    "status" "FindingStatus" NOT NULL DEFAULT 'draft',
    "dueDate" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "auditId" TEXT NOT NULL,
    "questionId" TEXT,
    "categoryId" TEXT,
    "createdByUserId" TEXT,
    "reviewedByUserId" TEXT,

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FindingComment" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorRole" "FindingCommentRole" NOT NULL DEFAULT 'consultant',
    "authorName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "findingId" TEXT NOT NULL,
    "authorUserId" TEXT,

    CONSTRAINT "FindingComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActionItem_auditId_status_priority_idx" ON "ActionItem"("auditId", "status", "priority");

-- CreateIndex
CREATE INDEX "ActionItem_findingId_idx" ON "ActionItem"("findingId");

-- CreateIndex
CREATE INDEX "Finding_auditId_status_idx" ON "Finding"("auditId", "status");

-- CreateIndex
CREATE INDEX "Finding_auditId_severity_idx" ON "Finding"("auditId", "severity");

-- CreateIndex
CREATE INDEX "FindingComment_findingId_createdAt_idx" ON "FindingComment"("findingId", "createdAt");

-- AddForeignKey
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FindingComment" ADD CONSTRAINT "FindingComment_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FindingComment" ADD CONSTRAINT "FindingComment_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
