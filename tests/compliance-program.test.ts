import test from "node:test";
import assert from "node:assert/strict";
import {
  DocumentStatus,
  DocumentType,
  TrainingAssignmentStatus,
  TrainingCampaignStatus,
} from "@prisma/client";
import {
  calculateDeliveryCompleteness,
  deriveDocumentStatus,
  deriveTrainingCampaignStatus,
  getCurrentProgramWeek,
} from "@/lib/compliance-program";
import { getTotalQuestionCount } from "@/data/nis2-framework";

test("getCurrentProgramWeek maps start date into capped 30-day window weeks", () => {
  const start = new Date("2026-03-01T00:00:00.000Z");
  assert.equal(getCurrentProgramWeek(start, new Date("2026-03-01T00:00:00.000Z")), 1);
  assert.equal(getCurrentProgramWeek(start, new Date("2026-03-10T00:00:00.000Z")), 2);
  assert.equal(getCurrentProgramWeek(start, new Date("2026-03-19T00:00:00.000Z")), 3);
  assert.equal(getCurrentProgramWeek(start, new Date("2026-04-20T00:00:00.000Z")), 4);
});

test("deriveDocumentStatus escalates critical edited documents and unanswered drafts", () => {
  const customerInput = deriveDocumentStatus({
    type: DocumentType.access_control_policy,
    answers: [],
    findings: [],
  });
  assert.equal(customerInput, DocumentStatus.customer_input_needed);

  const expertReview = deriveDocumentStatus({
    type: DocumentType.incident_response_policy,
    answers: [
      { questionId: "ih-001", value: "fulfilled" },
      { questionId: "ih-002", value: "not_fulfilled" },
      { questionId: "ih-003", value: "fulfilled" },
      { questionId: "ih-004", value: "fulfilled" },
      { questionId: "ih-005", value: "fulfilled" },
    ],
    findings: [],
    manualEditsCount: 1,
  });
  assert.equal(expertReview, DocumentStatus.expert_review_needed);

  const legalReview = deriveDocumentStatus({
    type: DocumentType.incident_response_policy,
    answers: [
      { questionId: "ih-001", value: "fulfilled" },
      { questionId: "ih-002", value: "fulfilled" },
      { questionId: "ih-003", value: "fulfilled" },
      { questionId: "ih-004", value: "fulfilled" },
      { questionId: "ih-005", value: "fulfilled" },
    ],
    findings: [],
    hasLegalReviewCase: true,
  });
  assert.equal(legalReview, DocumentStatus.legal_review_needed);
});

test("deriveTrainingCampaignStatus respects overdue and completed assignments", () => {
  const overdue = deriveTrainingCampaignStatus([
    {
      status: TrainingAssignmentStatus.pending,
      dueDate: new Date("2026-03-01T00:00:00.000Z"),
    },
  ], new Date("2026-03-13T00:00:00.000Z"));
  assert.equal(overdue, TrainingCampaignStatus.overdue);

  const complete = deriveTrainingCampaignStatus([
    {
      status: TrainingAssignmentStatus.completed,
      dueDate: new Date("2026-03-20T00:00:00.000Z"),
    },
    {
      status: TrainingAssignmentStatus.completed,
      dueDate: new Date("2026-03-20T00:00:00.000Z"),
    },
  ]);
  assert.equal(complete, TrainingCampaignStatus.completed);
});

test("calculateDeliveryCompleteness captures assessment, policies, trainings, and review blockers", () => {
  const completeness = calculateDeliveryCompleteness({
    answers: Array.from({ length: getTotalQuestionCount() }, (_, index) => ({
      id: `a-${index}`,
      questionId: `q-${index}`,
      categoryId: "risk-management",
      value: "fulfilled",
      notes: null,
      auditId: "audit-1",
      updatedAt: new Date(),
    })),
    evidences: [],
    findings: [],
    actionItems: [],
    complianceProgram: {
      id: "program-1",
      auditId: "audit-1",
      status: "setup_in_progress",
      currentPhase: "training",
      currentWeek: 4,
      startDate: new Date(),
      targetDate: new Date(),
      completedAt: null,
      ownerUserId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    documentPackage: {
      id: "package-1",
      auditId: "audit-1",
      programId: "program-1",
      status: "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
      artifacts: [
        {
          id: "doc-1",
          documentPackageId: "package-1",
          auditId: "audit-1",
          type: "information_security_policy",
          title: "Information Security Policy",
          status: "approved",
          templateVersion: "v1",
          generatedContent: "content",
          customContent: null,
          lastGeneratedAt: new Date(),
          approvedAt: new Date(),
          publishedAt: null,
          lastEditedByUserId: null,
          manualEditsCount: 0,
          metadata: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
    trainingCampaigns: [
      {
        id: "camp-1",
        auditId: "audit-1",
        programId: "program-1",
        type: "security_basics",
        title: "Security Basics",
        targetGroup: "All employees",
        status: "completed",
        isMandatory: true,
        dueDate: new Date(),
        lastReminderAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignments: [
          {
            id: "assign-1",
            campaignId: "camp-1",
            participantLabel: "All employees",
            participantEmail: null,
            status: "completed",
            completionPercent: 100,
            quizScore: 90,
            invitedAt: null,
            reminderSentAt: null,
            dueDate: new Date(),
            completedAt: new Date(),
            metadata: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            certificate: {
              id: "cert-1",
              assignmentId: "assign-1",
              certificateNumber: "CERT-1",
              issuedAt: new Date(),
              url: null,
              payload: null,
            },
          },
        ],
      },
    ],
    reviewCases: [],
    id: "audit-1",
    companyName: "Example GmbH",
    revenue: null,
    employeeCount: null,
    industry: null,
    locale: "de",
    isPremium: true,
    frameworkVersion: "nis2-2026-v1",
    methodologyVersion: "methodology-v1",
    isLocked: false,
    lockedAt: null,
    overallScore: null,
    riskLevel: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: null,
    organizationId: null,
    clientId: null,
    clientName: null,
    clientLogo: null,
  } as never);

  assert.equal(completeness.assessmentCompleted, true);
  assert.equal(completeness.policiesApproved, true);
  assert.equal(completeness.trainingsComplete, true);
  assert.equal(completeness.openReviewCases, 0);
  assert.equal(completeness.readyForFinalReview, true);
});
