import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { NIS2_CATEGORIES } from "@/data/nis2-framework";
import { calculateAllCategoryScores } from "@/lib/scoring";
import type { AnswerValue } from "@/data/nis2-framework";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const audits = await prisma.audit.findMany({
      where: { userId: user.id },
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
      const overallScore =
        categoryScores.length > 0
          ? Math.round(
              categoryScores.reduce((s, c) => s + c.score, 0) /
                categoryScores.length
            )
          : 0;
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
  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
