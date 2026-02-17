import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NIS2_CATEGORIES, type AnswerValue } from "@/data/nis2-framework";
import { calculateAuditScoreV2 } from "@/lib/scoring";
import { calculateRiskProfileV1 } from "@/lib/risk-engine";
import { FRAMEWORK_VERSION, METHODOLOGY_VERSION } from "@/lib/audit-methodology";

function toAnswersMap(
  answers: Array<{ questionId: string; value: string }>
): Map<string, AnswerValue> {
  const map = new Map<string, AnswerValue>();
  for (const answer of answers) {
    map.set(answer.questionId, answer.value as AnswerValue);
  }
  return map;
}

export async function getOrCreateAuditSnapshot(auditId: string) {
  const existingSnapshot = await prisma.auditSnapshot.findFirst({
    where: { auditId },
    orderBy: { createdAt: "desc" },
  });
  if (existingSnapshot) {
    return existingSnapshot;
  }

  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    include: { answers: true },
  });
  if (!audit) return null;

  const answersMap = toAnswersMap(audit.answers);
  const scoring = calculateAuditScoreV2(answersMap, NIS2_CATEGORIES);
  const risk = calculateRiskProfileV1({
    overallScore: scoring.overallScore,
    criticalGapCount: scoring.criticalGapCount,
    gapCount: scoring.gapCount,
    revenue: audit.revenue,
    employeeCount: audit.employeeCount,
  });

  const payload = JSON.parse(
    JSON.stringify({
      summary: {
        overallScore: scoring.overallScore,
        coverageRate: scoring.coverageRate,
        gapCount: scoring.gapCount,
        criticalGapCount: scoring.criticalGapCount,
        riskLevel: risk.level,
        confidence: risk.confidence,
        potentialFine: risk.potentialFine,
        rationale: risk.rationale,
      },
      categoryScores: scoring.categoryScores,
      generatedAt: new Date().toISOString(),
    })
  ) as Prisma.InputJsonValue;

  return prisma.$transaction(async (tx) => {
    await tx.audit.update({
      where: { id: audit.id },
      data: {
        isLocked: true,
        lockedAt: new Date(),
        overallScore: scoring.overallScore,
        riskLevel: risk.level,
        frameworkVersion: audit.frameworkVersion || FRAMEWORK_VERSION,
        methodologyVersion: audit.methodologyVersion || METHODOLOGY_VERSION,
      },
    });

    return tx.auditSnapshot.create({
      data: {
        auditId: audit.id,
        frameworkVersion: audit.frameworkVersion || FRAMEWORK_VERSION,
        methodologyVersion: audit.methodologyVersion || METHODOLOGY_VERSION,
        overallScore: scoring.overallScore,
        riskLevel: risk.level,
        payload,
      },
    });
  });
}
