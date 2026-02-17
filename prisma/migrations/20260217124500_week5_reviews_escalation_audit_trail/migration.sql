-- AlterTable
ALTER TABLE "Finding" ADD COLUMN "reviewOwnerUserId" TEXT;

-- CreateTable
CREATE TABLE "FindingStatusHistory" (
    "id" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "fromStatus" "FindingStatus",
    "toStatus" "FindingStatus" NOT NULL,
    "changedByUserId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FindingStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FindingEscalationEvent" (
    "id" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "deliveryTarget" TEXT NOT NULL,
    "escalationDate" TIMESTAMP(3) NOT NULL,
    "escalatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusSnapshot" "FindingStatus" NOT NULL,
    "dueDateSnapshot" TIMESTAMP(3),
    "success" BOOLEAN NOT NULL DEFAULT false,
    "responseStatus" INTEGER,
    "errorMessage" TEXT,
    "payload" JSONB NOT NULL,
    "fingerprint" TEXT NOT NULL,

    CONSTRAINT "FindingEscalationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Finding_reviewOwnerUserId_status_idx" ON "Finding"("reviewOwnerUserId", "status");

-- CreateIndex
CREATE INDEX "FindingStatusHistory_findingId_createdAt_idx" ON "FindingStatusHistory"("findingId", "createdAt");

-- CreateIndex
CREATE INDEX "FindingStatusHistory_createdAt_idx" ON "FindingStatusHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FindingEscalationEvent_fingerprint_key" ON "FindingEscalationEvent"("fingerprint");

-- CreateIndex
CREATE INDEX "FindingEscalationEvent_findingId_escalatedAt_idx" ON "FindingEscalationEvent"("findingId", "escalatedAt");

-- CreateIndex
CREATE INDEX "FindingEscalationEvent_escalationDate_idx" ON "FindingEscalationEvent"("escalationDate");

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_reviewOwnerUserId_fkey" FOREIGN KEY ("reviewOwnerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FindingStatusHistory" ADD CONSTRAINT "FindingStatusHistory_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FindingStatusHistory" ADD CONSTRAINT "FindingStatusHistory_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FindingEscalationEvent" ADD CONSTRAINT "FindingEscalationEvent_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
