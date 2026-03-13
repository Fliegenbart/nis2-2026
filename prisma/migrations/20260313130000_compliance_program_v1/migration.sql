CREATE TYPE "ComplianceProgramStatus" AS ENUM (
    'setup_in_progress',
    'blocked',
    'final_review',
    'continuous_compliance',
    'completed'
);

CREATE TYPE "ComplianceProgramPhase" AS ENUM (
    'assessment',
    'gap_review',
    'roadmap',
    'policies',
    'controls',
    'training',
    'final_review',
    'continuous_compliance'
);

CREATE TYPE "DocumentType" AS ENUM (
    'information_security_policy',
    'access_control_policy',
    'incident_response_policy',
    'backup_policy',
    'vendor_security_policy',
    'cyber_hygiene_handbook',
    'incident_communication_plan'
);

CREATE TYPE "DocumentStatus" AS ENUM (
    'generated',
    'customer_input_needed',
    'expert_review_needed',
    'legal_review_needed',
    'approved',
    'published'
);

CREATE TYPE "TrainingCampaignType" AS ENUM (
    'security_basics',
    'phishing_awareness',
    'incident_reporting',
    'password_security',
    'sensitive_data_handling',
    'management_cybersecurity_briefing'
);

CREATE TYPE "TrainingCampaignStatus" AS ENUM (
    'planned',
    'active',
    'completed',
    'overdue'
);

CREATE TYPE "TrainingAssignmentStatus" AS ENUM (
    'pending',
    'invited',
    'in_progress',
    'completed',
    'overdue'
);

CREATE TYPE "ReviewCaseType" AS ENUM (
    'legal',
    'security_expert',
    'management_signoff'
);

CREATE TYPE "ReviewCaseStatus" AS ENUM (
    'open',
    'in_progress',
    'resolved',
    'dismissed'
);

CREATE TYPE "ReviewCaseDecision" AS ENUM (
    'approved',
    'changes_required',
    'escalated',
    'rejected',
    'no_action'
);

CREATE TABLE "ComplianceProgram" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "status" "ComplianceProgramStatus" NOT NULL DEFAULT 'setup_in_progress',
    "currentPhase" "ComplianceProgramPhase" NOT NULL DEFAULT 'assessment',
    "currentWeek" INTEGER NOT NULL DEFAULT 1,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "ownerUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ComplianceProgram_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentPackage" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "programId" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'generated',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DocumentPackage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentArtifact" (
    "id" TEXT NOT NULL,
    "documentPackageId" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'generated',
    "templateVersion" TEXT NOT NULL DEFAULT 'v1',
    "generatedContent" TEXT NOT NULL,
    "customContent" TEXT,
    "lastGeneratedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "lastEditedByUserId" TEXT,
    "manualEditsCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DocumentArtifact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrainingCampaign" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "programId" TEXT,
    "type" "TrainingCampaignType" NOT NULL,
    "title" TEXT NOT NULL,
    "targetGroup" TEXT NOT NULL,
    "status" "TrainingCampaignStatus" NOT NULL DEFAULT 'planned',
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "dueDate" TIMESTAMP(3),
    "lastReminderAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TrainingCampaign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrainingAssignment" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "participantLabel" TEXT NOT NULL,
    "participantEmail" TEXT,
    "status" "TrainingAssignmentStatus" NOT NULL DEFAULT 'pending',
    "completionPercent" INTEGER NOT NULL DEFAULT 0,
    "quizScore" INTEGER,
    "invitedAt" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TrainingAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrainingCertificate" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT,
    "payload" JSONB,
    CONSTRAINT "TrainingCertificate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReviewCase" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "programId" TEXT,
    "type" "ReviewCaseType" NOT NULL,
    "status" "ReviewCaseStatus" NOT NULL DEFAULT 'open',
    "decision" "ReviewCaseDecision",
    "title" TEXT NOT NULL,
    "triggerReason" TEXT NOT NULL,
    "details" TEXT,
    "source" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "affectedDocumentArtifactId" TEXT,
    "affectedTrainingCampaignId" TEXT,
    "reviewedByUserId" TEXT,
    "assignedToUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ReviewCase_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ComplianceProgram_auditId_key" ON "ComplianceProgram"("auditId");
CREATE INDEX "ComplianceProgram_status_currentPhase_idx" ON "ComplianceProgram"("status", "currentPhase");
CREATE INDEX "ComplianceProgram_ownerUserId_status_idx" ON "ComplianceProgram"("ownerUserId", "status");

CREATE UNIQUE INDEX "DocumentPackage_auditId_key" ON "DocumentPackage"("auditId");
CREATE UNIQUE INDEX "DocumentPackage_programId_key" ON "DocumentPackage"("programId");

CREATE UNIQUE INDEX "DocumentArtifact_documentPackageId_type_key" ON "DocumentArtifact"("documentPackageId", "type");
CREATE INDEX "DocumentArtifact_auditId_status_idx" ON "DocumentArtifact"("auditId", "status");
CREATE INDEX "DocumentArtifact_type_status_idx" ON "DocumentArtifact"("type", "status");

CREATE UNIQUE INDEX "TrainingCampaign_auditId_type_key" ON "TrainingCampaign"("auditId", "type");
CREATE INDEX "TrainingCampaign_auditId_status_idx" ON "TrainingCampaign"("auditId", "status");
CREATE INDEX "TrainingCampaign_dueDate_status_idx" ON "TrainingCampaign"("dueDate", "status");

CREATE INDEX "TrainingAssignment_campaignId_status_idx" ON "TrainingAssignment"("campaignId", "status");

CREATE UNIQUE INDEX "TrainingCertificate_assignmentId_key" ON "TrainingCertificate"("assignmentId");
CREATE UNIQUE INDEX "TrainingCertificate_certificateNumber_key" ON "TrainingCertificate"("certificateNumber");

CREATE UNIQUE INDEX "ReviewCase_fingerprint_key" ON "ReviewCase"("fingerprint");
CREATE INDEX "ReviewCase_auditId_status_idx" ON "ReviewCase"("auditId", "status");
CREATE INDEX "ReviewCase_type_status_idx" ON "ReviewCase"("type", "status");
CREATE INDEX "ReviewCase_assignedToUserId_status_idx" ON "ReviewCase"("assignedToUserId", "status");

ALTER TABLE "ComplianceProgram"
    ADD CONSTRAINT "ComplianceProgram_auditId_fkey"
    FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ComplianceProgram"
    ADD CONSTRAINT "ComplianceProgram_ownerUserId_fkey"
    FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DocumentPackage"
    ADD CONSTRAINT "DocumentPackage_auditId_fkey"
    FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentPackage"
    ADD CONSTRAINT "DocumentPackage_programId_fkey"
    FOREIGN KEY ("programId") REFERENCES "ComplianceProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DocumentArtifact"
    ADD CONSTRAINT "DocumentArtifact_documentPackageId_fkey"
    FOREIGN KEY ("documentPackageId") REFERENCES "DocumentPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentArtifact"
    ADD CONSTRAINT "DocumentArtifact_auditId_fkey"
    FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentArtifact"
    ADD CONSTRAINT "DocumentArtifact_lastEditedByUserId_fkey"
    FOREIGN KEY ("lastEditedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TrainingCampaign"
    ADD CONSTRAINT "TrainingCampaign_auditId_fkey"
    FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TrainingCampaign"
    ADD CONSTRAINT "TrainingCampaign_programId_fkey"
    FOREIGN KEY ("programId") REFERENCES "ComplianceProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TrainingAssignment"
    ADD CONSTRAINT "TrainingAssignment_campaignId_fkey"
    FOREIGN KEY ("campaignId") REFERENCES "TrainingCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TrainingCertificate"
    ADD CONSTRAINT "TrainingCertificate_assignmentId_fkey"
    FOREIGN KEY ("assignmentId") REFERENCES "TrainingAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReviewCase"
    ADD CONSTRAINT "ReviewCase_auditId_fkey"
    FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReviewCase"
    ADD CONSTRAINT "ReviewCase_programId_fkey"
    FOREIGN KEY ("programId") REFERENCES "ComplianceProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ReviewCase"
    ADD CONSTRAINT "ReviewCase_affectedDocumentArtifactId_fkey"
    FOREIGN KEY ("affectedDocumentArtifactId") REFERENCES "DocumentArtifact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ReviewCase"
    ADD CONSTRAINT "ReviewCase_affectedTrainingCampaignId_fkey"
    FOREIGN KEY ("affectedTrainingCampaignId") REFERENCES "TrainingCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ReviewCase"
    ADD CONSTRAINT "ReviewCase_reviewedByUserId_fkey"
    FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ReviewCase"
    ADD CONSTRAINT "ReviewCase_assignedToUserId_fkey"
    FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
