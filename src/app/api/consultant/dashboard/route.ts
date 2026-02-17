import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CONSULTANT_READ_ROLES,
  requireAuthWithRoles,
} from "@/lib/auth";
import { NIS2_CATEGORIES } from "@/data/nis2-framework";
import { calculateAllCategoryScores, calculateOverallScore } from "@/lib/scoring";
import type { AnswerValue } from "@/data/nis2-framework";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthWithRoles(request, CONSULTANT_READ_ROLES);
    if (!user.organizationId) {
      return NextResponse.json({ audits: [] });
    }

    const audits = await prisma.audit.findMany({
      where: { organizationId: user.organizationId },
      include: {
        answers: true,
        actionItems: {
          select: { id: true, status: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const totalQuestions = NIS2_CATEGORIES.reduce(
      (sum, cat) => sum + cat.questions.length,
      0
    );

    const auditSummaries = audits.map((audit) => {
      const answersMap = new Map<string, AnswerValue>();
      for (const a of audit.answers) {
        answersMap.set(a.questionId, a.value as AnswerValue);
      }

      const categoryScores = calculateAllCategoryScores(answersMap, NIS2_CATEGORIES);
      const overallScore = calculateOverallScore(categoryScores);
      const openActions = audit.actionItems.filter((a) => a.status !== "done").length;
      const doneActions = audit.actionItems.filter((a) => a.status === "done").length;

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
