import {
  ComplianceProgramPhase,
  ComplianceProgramStatus,
  DocumentStatus,
  DocumentType,
  Prisma,
  PrismaClient,
  ReviewCaseStatus,
  ReviewCaseType,
  TrainingAssignmentStatus,
  TrainingCampaignStatus,
  TrainingCampaignType,
} from "@prisma/client";
import { getQuestionById, getTotalQuestionCount, type AnswerValue } from "@/data/nis2-framework";
import { prisma } from "@/lib/prisma";

type DbClient = PrismaClient | Prisma.TransactionClient;

type AuditComplianceState = Prisma.AuditGetPayload<{
  include: {
    answers: true;
    evidences: true;
    findings: true;
    actionItems: true;
    complianceProgram: true;
    documentPackage: {
      include: {
        artifacts: true;
      };
    };
    trainingCampaigns: {
      include: {
        assignments: {
          include: {
            certificate: true;
          };
        };
      };
    };
    reviewCases: true;
  };
}>;

type DocumentArtifactRecord = AuditComplianceState["documentPackage"] extends { artifacts: infer T }
  ? T extends Array<infer U>
    ? U
    : never
  : never;

type TrainingCampaignRecord = AuditComplianceState["trainingCampaigns"][number];

const DEFAULT_PROGRAM_DURATION_DAYS = 30;

const LEGAL_REVIEW_QUESTION_IDS = ["ih-002", "sc-002", "co-003", "ht-002"] as const;
const MANAGEMENT_SIGNOFF_QUESTION_IDS = ["ht-002", "as-004"] as const;
const CRITICAL_DOCUMENT_TYPES = new Set<DocumentType>([
  DocumentType.incident_response_policy,
  DocumentType.vendor_security_policy,
  DocumentType.incident_communication_plan,
]);

const DOCUMENT_BLUEPRINTS: Array<{
  type: DocumentType;
  title: string;
  questionIds: string[];
}> = [
  {
    type: DocumentType.information_security_policy,
    title: "Information Security Policy",
    questionIds: ["rm-001", "rm-002", "rm-004", "as-004"],
  },
  {
    type: DocumentType.access_control_policy,
    title: "Access Control Policy",
    questionIds: ["au-001", "au-002", "au-003", "au-004"],
  },
  {
    type: DocumentType.incident_response_policy,
    title: "Incident Response Policy",
    questionIds: ["ih-001", "ih-002", "ih-003", "ih-004", "ih-005"],
  },
  {
    type: DocumentType.backup_policy,
    title: "Backup Policy",
    questionIds: ["bc-001", "bc-002", "bc-003", "bc-004"],
  },
  {
    type: DocumentType.vendor_security_policy,
    title: "Vendor Security Policy",
    questionIds: ["sc-001", "sc-002", "sc-003", "sc-004"],
  },
  {
    type: DocumentType.cyber_hygiene_handbook,
    title: "Cyber Hygiene Handbook",
    questionIds: ["ht-001", "ht-003", "ht-004", "au-002"],
  },
  {
    type: DocumentType.incident_communication_plan,
    title: "Incident Communication Plan",
    questionIds: ["ih-002", "co-001", "co-002", "co-003", "co-004"],
  },
];

const TRAINING_BLUEPRINTS: Array<{
  type: TrainingCampaignType;
  title: string;
  targetGroup: string;
  mandatory: boolean;
  dueInDays: number;
}> = [
  {
    type: TrainingCampaignType.security_basics,
    title: "Security Basics",
    targetGroup: "All employees",
    mandatory: true,
    dueInDays: 21,
  },
  {
    type: TrainingCampaignType.phishing_awareness,
    title: "Phishing Awareness",
    targetGroup: "All employees",
    mandatory: true,
    dueInDays: 24,
  },
  {
    type: TrainingCampaignType.incident_reporting,
    title: "Incident Reporting",
    targetGroup: "All employees",
    mandatory: true,
    dueInDays: 14,
  },
  {
    type: TrainingCampaignType.password_security,
    title: "Password Security",
    targetGroup: "All employees",
    mandatory: true,
    dueInDays: 18,
  },
  {
    type: TrainingCampaignType.sensitive_data_handling,
    title: "Sensitive Data Handling",
    targetGroup: "All employees",
    mandatory: true,
    dueInDays: 20,
  },
  {
    type: TrainingCampaignType.management_cybersecurity_briefing,
    title: "Management Cybersecurity Briefing",
    targetGroup: "Management",
    mandatory: true,
    dueInDays: 10,
  },
];

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function getCurrentProgramWeek(startDate: Date, now = new Date()): number {
  const diff = now.getTime() - startDate.getTime();
  return Math.max(1, Math.min(4, Math.floor(diff / (1000 * 60 * 60 * 24 * 7)) + 1));
}

function getAnswerValue(
  answers: Array<{ questionId: string; value: string }>,
  questionId: string
): AnswerValue | null {
  const answer = answers.find((item) => item.questionId === questionId);
  return (answer?.value as AnswerValue | undefined) ?? null;
}

function getDocumentBlueprint(type: DocumentType) {
  return DOCUMENT_BLUEPRINTS.find((item) => item.type === type);
}

function getRelevantQuestions(type: DocumentType) {
  const blueprint = getDocumentBlueprint(type);
  if (!blueprint) return [];
  return blueprint.questionIds
    .map((questionId) => getQuestionById(questionId))
    .filter((question): question is NonNullable<typeof question> => Boolean(question));
}

function summarizeRelevantFindings(
  audit: Pick<AuditComplianceState, "findings">
) {
  return audit.findings
    .filter((finding) => finding.status !== "closed")
    .slice(0, 3)
    .map((finding) => `${finding.title} (${finding.severity})`);
}

export function deriveDocumentStatus(params: {
  type: DocumentType;
  answers: Array<{ questionId: string; value: string }>;
  findings: Array<{ severity: string; status: string }>;
  manualEditsCount?: number;
  hasLegalReviewCase?: boolean;
}): DocumentStatus {
  if (params.hasLegalReviewCase) {
    return DocumentStatus.legal_review_needed;
  }

  const relevantQuestions = getRelevantQuestions(params.type);
  const hasUnknowns = relevantQuestions.some((question) => !getAnswerValue(params.answers, question.id));
  if (hasUnknowns) {
    return DocumentStatus.customer_input_needed;
  }

  const hasRelevantGap = relevantQuestions.some((question) => {
    const value = getAnswerValue(params.answers, question.id);
    return value === "partial" || value === "not_fulfilled";
  });

  const hasCriticalOpenFinding = params.findings.some(
    (finding) => finding.status !== "closed" && finding.severity === "critical"
  );

  if (
    CRITICAL_DOCUMENT_TYPES.has(params.type) &&
    (hasRelevantGap || hasCriticalOpenFinding || (params.manualEditsCount ?? 0) > 0)
  ) {
    return DocumentStatus.expert_review_needed;
  }

  return DocumentStatus.generated;
}

export function deriveTrainingCampaignStatus(
  assignments: Array<{
    status: TrainingAssignmentStatus;
    dueDate: Date | null;
  }>,
  now = new Date()
): TrainingCampaignStatus {
  if (assignments.length === 0) {
    return TrainingCampaignStatus.planned;
  }

  if (
    assignments.some(
      (assignment) =>
        assignment.status !== TrainingAssignmentStatus.completed &&
        assignment.dueDate &&
        assignment.dueDate.getTime() < now.getTime()
    )
  ) {
    return TrainingCampaignStatus.overdue;
  }

  if (assignments.every((assignment) => assignment.status === TrainingAssignmentStatus.completed)) {
    return TrainingCampaignStatus.completed;
  }

  if (
    assignments.some(
      (assignment) =>
        assignment.status === TrainingAssignmentStatus.in_progress ||
        assignment.status === TrainingAssignmentStatus.invited
    )
  ) {
    return TrainingCampaignStatus.active;
  }

  return TrainingCampaignStatus.planned;
}

export function calculateDeliveryCompleteness(audit: AuditComplianceState) {
  const totalQuestions = getTotalQuestionCount();
  const answeredCount = audit.answers.length;
  const documents = audit.documentPackage?.artifacts ?? [];
  const approvedDocuments = documents.filter((artifact) =>
    artifact.status === DocumentStatus.approved || artifact.status === DocumentStatus.published
  ).length;
  const assignments = audit.trainingCampaigns.flatMap((campaign) => campaign.assignments);
  const completedAssignments = assignments.filter(
    (assignment) => assignment.status === TrainingAssignmentStatus.completed
  ).length;
  const openReviewCases = audit.reviewCases.filter(
    (reviewCase) =>
      reviewCase.status === ReviewCaseStatus.open ||
      reviewCase.status === ReviewCaseStatus.in_progress
  ).length;

  const assessmentCompleted = totalQuestions > 0 && answeredCount >= totalQuestions;
  const policiesApproved = documents.length > 0 && approvedDocuments === documents.length;
  const trainingsComplete =
    audit.trainingCampaigns.length > 0 &&
    audit.trainingCampaigns.every((campaign) => campaign.status === TrainingCampaignStatus.completed);

  const progress =
    Math.round(
      ((answeredCount / totalQuestions) * 0.35 +
        (documents.length === 0 ? 0 : approvedDocuments / documents.length) * 0.35 +
        (assignments.length === 0 ? 0 : completedAssignments / assignments.length) * 0.2 +
        (openReviewCases === 0 ? 0.1 : 0)) *
        100
    ) || 0;

  return {
    answeredCount,
    totalQuestions,
    documentsTotal: documents.length,
    documentsApproved: approvedDocuments,
    assignmentsTotal: assignments.length,
    assignmentsCompleted: completedAssignments,
    openReviewCases,
    assessmentCompleted,
    policiesApproved,
    trainingsComplete,
    readyForFinalReview:
      assessmentCompleted && policiesApproved && trainingsComplete && openReviewCases === 0,
    progress,
  };
}

function generateDocumentContent(audit: AuditComplianceState, type: DocumentType): string {
  const blueprint = getDocumentBlueprint(type);
  const relevantQuestions = getRelevantQuestions(type);
  const openFindings = summarizeRelevantFindings(audit);
  const companyName = audit.companyName || audit.clientName || "Customer Organization";

  const requirementLines = relevantQuestions.map((question) => {
    const answer = getAnswerValue(audit.answers, question.id);
    const answerLabel =
      answer === "fulfilled"
        ? "fulfilled"
        : answer === "partial"
          ? "partial"
          : answer === "not_fulfilled"
            ? "not fulfilled"
            : "open";

    return `- ${question.text.en} (${question.legalReference}) -> current state: ${answerLabel}`;
  });

  const recommendationLines = relevantQuestions.map(
    (question) => `- ${question.recommendation.en}`
  );

  const findingLines =
    openFindings.length > 0
      ? openFindings.map((finding) => `- ${finding}`)
      : ["- No open findings linked to this document yet."];

  return [
    `# ${blueprint?.title ?? "Compliance Document"}`,
    "",
    `Prepared for ${companyName}. This draft is system-generated to support NIS2 implementation and requires human validation before external use.`,
    "",
    "## Purpose",
    `This document defines the baseline controls and operating expectations for ${blueprint?.title ?? "the relevant control domain"}.`,
    "",
    "## Relevant requirements",
    ...requirementLines,
    "",
    "## Implementation guidance",
    ...recommendationLines,
    "",
    "## Current open findings",
    ...findingLines,
    "",
    "## Human review checkpoints",
    "- Validate scope, owners, and escalation contacts.",
    "- Confirm customer-specific deviations and regulatory edge cases.",
    "- Do not treat this draft as legal advice or a final external statement without approval.",
  ].join("\n");
}

function programPhaseForWeek(week: number): ComplianceProgramPhase {
  if (week <= 1) return ComplianceProgramPhase.assessment;
  if (week === 2) return ComplianceProgramPhase.roadmap;
  if (week === 3) return ComplianceProgramPhase.policies;
  return ComplianceProgramPhase.training;
}

async function getAuditComplianceState(auditId: string, db: DbClient = prisma) {
  return db.audit.findUnique({
    where: { id: auditId },
    include: {
      answers: true,
      evidences: true,
      findings: true,
      actionItems: true,
      complianceProgram: true,
      documentPackage: {
        include: {
          artifacts: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
      trainingCampaigns: {
        include: {
          assignments: {
            include: {
              certificate: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      reviewCases: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

async function ensureProgramDefaults(db: DbClient, audit: AuditComplianceState) {
  const ownerUserId = audit.userId ?? null;
  let program = audit.complianceProgram;

  if (!program) {
    program = await db.complianceProgram.create({
      data: {
        auditId: audit.id,
        ownerUserId,
        targetDate: addDays(audit.createdAt, DEFAULT_PROGRAM_DURATION_DAYS),
      },
    });
  } else {
    const currentWeek = getCurrentProgramWeek(program.startDate);
    const nextPhase =
      program.currentPhase === ComplianceProgramPhase.continuous_compliance
        ? ComplianceProgramPhase.continuous_compliance
        : program.currentPhase === ComplianceProgramPhase.final_review
          ? ComplianceProgramPhase.final_review
          : programPhaseForWeek(currentWeek);

    if (program.currentWeek !== currentWeek || program.currentPhase !== nextPhase) {
      program = await db.complianceProgram.update({
        where: { id: program.id },
        data: {
          currentWeek,
          currentPhase: nextPhase,
        },
      });
    }
  }

  return program;
}

async function ensureDocumentDefaults(
  db: DbClient,
  audit: AuditComplianceState,
  programId: string
) {
  let documentPackage = audit.documentPackage;

  if (!documentPackage) {
    documentPackage = await db.documentPackage.create({
      data: {
        auditId: audit.id,
        programId,
      },
      include: {
        artifacts: true,
      },
    });
  } else if (!documentPackage.programId) {
    documentPackage = await db.documentPackage.update({
      where: { id: documentPackage.id },
      data: { programId },
      include: {
        artifacts: true,
      },
    });
  }

  const existingByType = new Set(documentPackage.artifacts.map((artifact) => artifact.type));

  for (const blueprint of DOCUMENT_BLUEPRINTS) {
    if (existingByType.has(blueprint.type)) continue;

    await db.documentArtifact.create({
      data: {
        documentPackageId: documentPackage.id,
        auditId: audit.id,
        type: blueprint.type,
        title: blueprint.title,
        generatedContent: generateDocumentContent(audit, blueprint.type),
        status: deriveDocumentStatus({
          type: blueprint.type,
          answers: audit.answers,
          findings: audit.findings,
        }),
      },
    });
  }
}

async function ensureTrainingDefaults(
  db: DbClient,
  audit: AuditComplianceState,
  programId: string
) {
  const existingByType = new Set(audit.trainingCampaigns.map((campaign) => campaign.type));

  for (const blueprint of TRAINING_BLUEPRINTS) {
    if (existingByType.has(blueprint.type)) continue;

    const campaign = await db.trainingCampaign.create({
      data: {
        auditId: audit.id,
        programId,
        type: blueprint.type,
        title: blueprint.title,
        targetGroup: blueprint.targetGroup,
        isMandatory: blueprint.mandatory,
        dueDate: addDays(audit.createdAt, blueprint.dueInDays),
        status: TrainingCampaignStatus.planned,
      },
    });

    await db.trainingAssignment.create({
      data: {
        campaignId: campaign.id,
        participantLabel: blueprint.targetGroup,
        dueDate: campaign.dueDate,
      },
    });
  }
}

async function syncTrainingStatuses(db: DbClient, audit: AuditComplianceState) {
  for (const campaign of audit.trainingCampaigns) {
    const nextStatus = deriveTrainingCampaignStatus(
      campaign.assignments.map((assignment) => ({
        status: assignment.status,
        dueDate: assignment.dueDate,
      }))
    );

    if (campaign.status !== nextStatus) {
      await db.trainingCampaign.update({
        where: { id: campaign.id },
        data: { status: nextStatus },
      });
    }
  }
}

async function upsertAutoReviewCase(
  db: DbClient,
  input: {
    active: boolean;
    fingerprint: string;
    auditId: string;
    programId: string | null;
    type: ReviewCaseType;
    title: string;
    triggerReason: string;
    details?: string;
    source: string;
    affectedDocumentArtifactId?: string | null;
    affectedTrainingCampaignId?: string | null;
    preserveResolved?: boolean;
  }
) {
  if (input.active) {
    const existing = await db.reviewCase.findUnique({
      where: { fingerprint: input.fingerprint },
      select: { id: true, status: true },
    });

    if (
      existing &&
      input.preserveResolved &&
      (existing.status === ReviewCaseStatus.resolved ||
        existing.status === ReviewCaseStatus.dismissed)
    ) {
      return;
    }

    await db.reviewCase.upsert({
      where: { fingerprint: input.fingerprint },
      update: {
        type: input.type,
        title: input.title,
        triggerReason: input.triggerReason,
        details: input.details,
        source: input.source,
        status: ReviewCaseStatus.open,
        decision: null,
        reviewedAt: null,
        affectedDocumentArtifactId: input.affectedDocumentArtifactId ?? null,
        affectedTrainingCampaignId: input.affectedTrainingCampaignId ?? null,
      },
      create: {
        fingerprint: input.fingerprint,
        auditId: input.auditId,
        programId: input.programId,
        type: input.type,
        title: input.title,
        triggerReason: input.triggerReason,
        details: input.details,
        source: input.source,
        affectedDocumentArtifactId: input.affectedDocumentArtifactId ?? null,
        affectedTrainingCampaignId: input.affectedTrainingCampaignId ?? null,
      },
    });
    return;
  }

  const existing = await db.reviewCase.findUnique({
    where: { fingerprint: input.fingerprint },
    select: { id: true, status: true, source: true },
  });

  if (
    existing &&
    existing.source.startsWith("auto:") &&
    (existing.status === ReviewCaseStatus.open ||
      existing.status === ReviewCaseStatus.in_progress)
  ) {
    await db.reviewCase.update({
      where: { id: existing.id },
      data: {
        status: ReviewCaseStatus.dismissed,
        decision: null,
      },
    });
  }
}

async function syncReviewCases(db: DbClient, audit: AuditComplianceState) {
  const programId = audit.complianceProgram?.id ?? null;

  for (const questionId of LEGAL_REVIEW_QUESTION_IDS) {
    const question = getQuestionById(questionId);
    const value = getAnswerValue(audit.answers, questionId);
    await upsertAutoReviewCase(db, {
      active: value === "partial" || value === "not_fulfilled",
      fingerprint: `legal-answer-${audit.id}-${questionId}`,
      auditId: audit.id,
      programId,
      type: ReviewCaseType.legal,
      title: `${question?.text.en ?? questionId} requires legal review`,
      triggerReason: `Answer to ${questionId} indicates a legal or regulatory gap.`,
      details: question?.recommendation.en,
      source: "auto:answer-red-flag",
    });
  }

  for (const questionId of MANAGEMENT_SIGNOFF_QUESTION_IDS) {
    const question = getQuestionById(questionId);
    const value = getAnswerValue(audit.answers, questionId);
    await upsertAutoReviewCase(db, {
      active: value === "partial" || value === "not_fulfilled",
      fingerprint: `management-signoff-${audit.id}-${questionId}`,
      auditId: audit.id,
      programId,
      type: ReviewCaseType.management_signoff,
      title: `${question?.text.en ?? questionId} requires management sign-off`,
      triggerReason: `Management accountability checkpoint triggered by ${questionId}.`,
      details: question?.recommendation.en,
      source: "auto:management-checkpoint",
    });
  }

  const openCriticalFindings = audit.findings.filter(
    (finding) => finding.status !== "closed" && finding.severity === "critical"
  );
  await upsertAutoReviewCase(db, {
    active: openCriticalFindings.length > 0,
    fingerprint: `security-critical-findings-${audit.id}`,
    auditId: audit.id,
    programId,
    type: ReviewCaseType.security_expert,
    title: "Critical findings require security expert review",
    triggerReason: "One or more critical findings remain open.",
    details: openCriticalFindings.map((finding) => finding.title).join(", "),
    source: "auto:critical-findings",
  });

  const incidentBriefingCampaign = audit.trainingCampaigns.find(
    (campaign) => campaign.type === TrainingCampaignType.management_cybersecurity_briefing
  );
  if (incidentBriefingCampaign) {
    const incompleteAssignments = incidentBriefingCampaign.assignments.some(
      (assignment) => assignment.status !== TrainingAssignmentStatus.completed
    );
    await upsertAutoReviewCase(db, {
      active: incompleteAssignments,
      fingerprint: `management-training-${audit.id}`,
      auditId: audit.id,
      programId,
      type: ReviewCaseType.management_signoff,
      title: "Management cybersecurity briefing still incomplete",
      triggerReason: "Board and management training must be completed and evidenced.",
      details: incidentBriefingCampaign.title,
      source: "auto:training-checkpoint",
      affectedTrainingCampaignId: incidentBriefingCampaign.id,
    });
  }

  const artifacts = audit.documentPackage?.artifacts ?? [];
  for (const artifact of artifacts) {
    const hasManualDeviation =
      (artifact.manualEditsCount ?? 0) > 0 &&
      Boolean(artifact.customContent) &&
      artifact.customContent?.trim() !== artifact.generatedContent.trim();

    await upsertAutoReviewCase(db, {
      active: hasManualDeviation && CRITICAL_DOCUMENT_TYPES.has(artifact.type),
      fingerprint: `legal-document-edit-${artifact.id}-${artifact.manualEditsCount}`,
      auditId: audit.id,
      programId,
      type: ReviewCaseType.legal,
      title: `${artifact.title} has customer-specific edits`,
      triggerReason: "Critical policy edits require legal review before approval or publication.",
      details: "A manually customized critical document differs from the generated baseline.",
      source: "auto:document-edit",
      affectedDocumentArtifactId: artifact.id,
      preserveResolved: true,
    });
  }
}

async function syncDocumentStatuses(db: DbClient, audit: AuditComplianceState) {
  const artifacts = audit.documentPackage?.artifacts ?? [];

  for (const artifact of artifacts) {
    const hasLegalReviewCase = audit.reviewCases.some(
      (reviewCase) =>
        reviewCase.affectedDocumentArtifactId === artifact.id &&
        (reviewCase.status === ReviewCaseStatus.open ||
          reviewCase.status === ReviewCaseStatus.in_progress)
    );

    const nextStatus =
      artifact.status === DocumentStatus.approved || artifact.status === DocumentStatus.published
        ? artifact.status
        : deriveDocumentStatus({
            type: artifact.type,
            answers: audit.answers,
            findings: audit.findings,
            manualEditsCount: artifact.manualEditsCount,
            hasLegalReviewCase,
          });

    if (artifact.status !== nextStatus) {
      await db.documentArtifact.update({
        where: { id: artifact.id },
        data: { status: nextStatus },
      });
    }
  }
}

async function syncProgramStatus(db: DbClient, audit: AuditComplianceState) {
  const program = audit.complianceProgram;
  if (!program) return;

  const completeness = calculateDeliveryCompleteness(audit);

  let nextStatus: ComplianceProgramStatus;
  if (program.currentPhase === ComplianceProgramPhase.continuous_compliance) {
    nextStatus = ComplianceProgramStatus.continuous_compliance;
  } else if (completeness.readyForFinalReview && program.currentPhase === ComplianceProgramPhase.final_review) {
    nextStatus = ComplianceProgramStatus.completed;
  } else if (completeness.openReviewCases > 0) {
    nextStatus = ComplianceProgramStatus.blocked;
  } else if (program.currentPhase === ComplianceProgramPhase.final_review) {
    nextStatus = ComplianceProgramStatus.final_review;
  } else {
    nextStatus = ComplianceProgramStatus.setup_in_progress;
  }

  if (program.status !== nextStatus) {
    await db.complianceProgram.update({
      where: { id: program.id },
      data: {
        status: nextStatus,
        completedAt: nextStatus === ComplianceProgramStatus.completed ? new Date() : null,
      },
    });
  }
}

export async function ensureComplianceArtifactsForAudit(auditId: string) {
  await prisma.$transaction(async (tx) => {
    const audit = await getAuditComplianceState(auditId, tx);
    if (!audit) return;

    const program = await ensureProgramDefaults(tx, audit);
    await ensureDocumentDefaults(tx, audit, program.id);
    await ensureTrainingDefaults(tx, audit, program.id);

    const refreshed = await getAuditComplianceState(auditId, tx);
    if (!refreshed) return;

    await syncTrainingStatuses(tx, refreshed);
    const withTrainingState = await getAuditComplianceState(auditId, tx);
    if (!withTrainingState) return;

    await syncReviewCases(tx, withTrainingState);
    const withReviewCases = await getAuditComplianceState(auditId, tx);
    if (!withReviewCases) return;

    await syncDocumentStatuses(tx, withReviewCases);
    const withDocuments = await getAuditComplianceState(auditId, tx);
    if (!withDocuments) return;

    await syncProgramStatus(tx, withDocuments);
  });

  return getAuditComplianceOverview(auditId);
}

export async function getAuditComplianceOverview(auditId: string) {
  const audit = await getAuditComplianceState(auditId);
  if (!audit) return null;

  const completeness = calculateDeliveryCompleteness(audit);

  return {
    ...audit,
    deliveryCompleteness: completeness,
    complianceProgramSummary: {
      phase: audit.complianceProgram?.currentPhase ?? ComplianceProgramPhase.assessment,
      status: audit.complianceProgram?.status ?? ComplianceProgramStatus.setup_in_progress,
      currentWeek:
        audit.complianceProgram?.currentWeek ??
        getCurrentProgramWeek(audit.createdAt),
      targetDate:
        audit.complianceProgram?.targetDate ??
        addDays(audit.createdAt, DEFAULT_PROGRAM_DURATION_DAYS),
      openReviewCases: completeness.openReviewCases,
      progress: completeness.progress,
    },
  };
}

export async function refreshDocumentArtifact(
  auditId: string,
  artifactId: string,
  options?: { lastEditedByUserId?: string | null }
) {
  const audit = await getAuditComplianceState(auditId);
  if (!audit?.documentPackage) {
    return null;
  }

  const artifact = audit.documentPackage.artifacts.find((item) => item.id === artifactId);
  if (!artifact) return null;

  const generatedContent = generateDocumentContent(audit, artifact.type);
  const updated = await prisma.documentArtifact.update({
    where: { id: artifactId },
    data: {
      generatedContent,
      lastGeneratedAt: new Date(),
      lastEditedByUserId: options?.lastEditedByUserId ?? null,
      status: deriveDocumentStatus({
        type: artifact.type,
        answers: audit.answers,
        findings: audit.findings,
        manualEditsCount: artifact.manualEditsCount,
      }),
    },
  });

  await ensureComplianceArtifactsForAudit(auditId);
  return updated;
}

export async function regenerateDocumentArtifacts(
  auditId: string,
  options?: {
    documentType?: DocumentType;
    lastEditedByUserId?: string | null;
  }
) {
  const audit = await getAuditComplianceState(auditId);
  const artifacts = audit?.documentPackage?.artifacts ?? [];
  const targetArtifacts = options?.documentType
    ? artifacts.filter((artifact) => artifact.type === options.documentType)
    : artifacts;

  const refreshed = [];
  for (const artifact of targetArtifacts) {
    const updated = await refreshDocumentArtifact(auditId, artifact.id, {
      lastEditedByUserId: options?.lastEditedByUserId,
    });
    if (updated) {
      refreshed.push(updated);
    }
  }

  return refreshed;
}

export function getInitialTrainingAssignmentStatus(
  completionPercent: number,
  dueDate: Date | null,
  now = new Date()
) {
  if (completionPercent >= 100) {
    return TrainingAssignmentStatus.completed;
  }
  if (dueDate && dueDate.getTime() < now.getTime()) {
    return TrainingAssignmentStatus.overdue;
  }
  if (completionPercent > 0) {
    return TrainingAssignmentStatus.in_progress;
  }
  return TrainingAssignmentStatus.pending;
}
