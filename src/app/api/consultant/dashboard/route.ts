import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CONSULTANT_READ_ROLES,
  requireAuthWithRoles,
} from "@/lib/auth";
import { NIS2_CATEGORIES } from "@/data/nis2-framework";
import { calculateAllCategoryScores, calculateOverallScore } from "@/lib/scoring";
import type { AnswerValue } from "@/data/nis2-framework";
import {
  ensureComplianceArtifactsForAudit,
  getAuditComplianceOverview,
} from "@/lib/compliance-program";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthWithRoles(request, CONSULTANT_READ_ROLES);
    if (!user.organizationId) {
      return NextResponse.json({ audits: [] });
    }

    const auditIds = await prisma.audit.findMany({
      where: { organizationId: user.organizationId },
      select: { id: true },
      orderBy: { updatedAt: "desc" },
    });

    await Promise.all(
      auditIds.map((audit) => ensureComplianceArtifactsForAudit(audit.id))
    );

    const audits = await Promise.all(
      auditIds.map((audit) => getAuditComplianceOverview(audit.id))
    );

    const totalQuestions = NIS2_CATEGORIES.reduce(
      (sum, cat) => sum + cat.questions.length,
      0
    );

    const auditSummaries = audits
      .filter((audit): audit is NonNullable<typeof audit> => Boolean(audit))
      .map((audit) => {
      const answersMap = new Map<string, AnswerValue>();
      for (const a of audit.answers) {
        answersMap.set(a.questionId, a.value as AnswerValue);
      }

      const categoryScores = calculateAllCategoryScores(answersMap, NIS2_CATEGORIES);
      const overallScore = calculateOverallScore(categoryScores);
      const openActions = audit.actionItems.filter((a) => a.status !== "done").length;
      const doneActions = audit.actionItems.filter((a) => a.status === "done").length;
      const openFindings = audit.findings.filter((f) => f.status !== "closed").length;
      const inReviewFindings = audit.findings.filter((f) => f.status === "in_review").length;
      const overdueFindings = audit.findings.filter((f) => {
        if (!f.dueDate || f.status === "closed") return false;
        return f.dueDate.getTime() < Date.now();
      }).length;
      const criticalOpenFindings = audit.findings.filter(
        (f) => f.status !== "closed" && f.severity === "critical"
      ).length;
      const documents = audit.documentPackage?.artifacts ?? [];
      const trainingAssignments = audit.trainingCampaigns.flatMap((campaign) => campaign.assignments);

      return {
        id: audit.id,
        clientName: audit.clientName,
        companyName: audit.companyName,
        industry: audit.industry,
        overallScore,
        answeredCount: audit.answers.length,
        totalQuestions,
        openActions,
        doneActions,
        openFindings,
        inReviewFindings,
        overdueFindings,
        criticalOpenFindings,
        programPhase: audit.complianceProgramSummary.phase,
        programStatus: audit.complianceProgramSummary.status,
        currentWeek: audit.complianceProgramSummary.currentWeek,
        deliveryProgress: audit.complianceProgramSummary.progress,
        documentsApproved: audit.deliveryCompleteness.documentsApproved,
        totalDocuments: documents.length,
        completedAssignments: audit.deliveryCompleteness.assignmentsCompleted,
        totalAssignments: trainingAssignments.length,
        openReviewCases: audit.deliveryCompleteness.openReviewCases,
        updatedAt: audit.updatedAt,
        createdAt: audit.createdAt,
      };
    });

    return NextResponse.json({ audits: auditSummaries });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
