import type { PrismaClient } from "@prisma/client";
import { calculateMaxFine } from "@/lib/fine-calculator";
import { ANSWER_WEIGHT } from "@/lib/audit-methodology";
import { prisma } from "@/lib/prisma";
import type { AnswerValue } from "@/data/nis2-framework";

export type RiskLevelV1 = "low" | "medium" | "high" | "critical";

export interface RiskInputV1 {
  overallScore: number;
  criticalGapCount: number;
  gapCount: number;
  revenue?: number | null;
  employeeCount?: number | null;
}

export interface RiskProfileV1 {
  level: RiskLevelV1;
  potentialFine: number;
  confidence: number;
  rationale: string[];
}

export interface ComputedRiskInputV1 {
  input: RiskInputV1;
  frameworkVersion: string;
  methodologyVersion: string;
  answeredControlCount: number;
  totalControlCount: number;
}

const RISK_LEVEL_ORDER: RiskLevelV1[] = ["low", "medium", "high", "critical"];

function escalate(level: RiskLevelV1, steps: number): RiskLevelV1 {
  const current = RISK_LEVEL_ORDER.indexOf(level);
  const next = Math.min(current + steps, RISK_LEVEL_ORDER.length - 1);
  return RISK_LEVEL_ORDER[next];
}

export function calculateRiskProfileV1(input: RiskInputV1): RiskProfileV1 {
  const rationale: string[] = [];

  let level: RiskLevelV1;
  if (input.overallScore <= 35) {
    level = "critical";
    rationale.push("Overall score below 35%");
  } else if (input.overallScore <= 55) {
    level = "high";
    rationale.push("Overall score below 55%");
  } else if (input.overallScore <= 75) {
    level = "medium";
    rationale.push("Overall score below 75%");
  } else {
    level = "low";
    rationale.push("Overall score above 75%");
  }

  if (input.criticalGapCount >= 3) {
    level = escalate(level, 1);
    rationale.push("Three or more critical control gaps");
  }
  if (input.gapCount >= 12) {
    level = escalate(level, 1);
    rationale.push("Large number of open gaps (>=12)");
  }
  if ((input.revenue ?? 0) >= 50_000_000 && input.overallScore < 70) {
    level = escalate(level, 1);
    rationale.push("High revenue exposure with sub-70 score");
  }
  if ((input.employeeCount ?? 0) >= 250 && input.gapCount >= 8) {
    level = escalate(level, 1);
    rationale.push("Large organization with many open gaps");
  }

  const revenue = input.revenue ?? 0;
  const potentialFine = revenue > 0 ? calculateMaxFine(revenue) : 10_000_000;

  const confidenceBase = input.gapCount > 0 ? 0.7 : 0.5;
  const confidenceBoost = Math.min(input.criticalGapCount * 0.05, 0.2);
  const confidence = Number(Math.min(confidenceBase + confidenceBoost, 0.95).toFixed(2));

  return {
    level,
    potentialFine,
    confidence,
    rationale,
  };
}

export async function buildRiskInputFromDatabaseV1(
  auditId: string,
  db: PrismaClient = prisma
): Promise<ComputedRiskInputV1 | null> {
  const audit = await db.audit.findUnique({
    where: { id: auditId },
    select: {
      id: true,
      revenue: true,
      employeeCount: true,
      frameworkVersion: true,
      methodologyVersion: true,
      answers: {
        select: {
          questionId: true,
          value: true,
        },
      },
    },
  });
  if (!audit) {
    return null;
  }

  const controls = await db.controlCatalog.findMany({
    where: {
      frameworkVersion: audit.frameworkVersion,
      methodologyVersion: audit.methodologyVersion,
    },
    select: {
      questionId: true,
      severity: true,
      weight: true,
    },
  });
  if (controls.length === 0) {
    throw new Error(
      `Control catalog missing for ${audit.frameworkVersion}/${audit.methodologyVersion}`
    );
  }

  const answersByQuestion = new Map<string, AnswerValue>(
    audit.answers.map((answer) => [answer.questionId, answer.value as AnswerValue])
  );

  let weightedEarned = 0;
  let weightedMax = 0;
  let gapCount = 0;
  let criticalGapCount = 0;
  let answeredControlCount = 0;

  for (const control of controls) {
    const answer = answersByQuestion.get(control.questionId);
    if (!answer) {
      continue;
    }

    const answerWeight = ANSWER_WEIGHT[answer];
    if (answerWeight === null) {
      continue;
    }

    answeredControlCount += 1;
    weightedMax += control.weight;
    weightedEarned += control.weight * answerWeight;

    if (answer !== "fulfilled") {
      gapCount += 1;
      if (control.severity === "kritisch") {
        criticalGapCount += 1;
      }
    }
  }

  const overallScore =
    weightedMax > 0 ? Math.round((weightedEarned / weightedMax) * 100) : 0;

  return {
    input: {
      overallScore,
      criticalGapCount,
      gapCount,
      revenue: audit.revenue,
      employeeCount: audit.employeeCount,
    },
    frameworkVersion: audit.frameworkVersion,
    methodologyVersion: audit.methodologyVersion,
    answeredControlCount,
    totalControlCount: controls.length,
  };
}

export async function calculateRiskProfileForAuditV1(
  auditId: string,
  db: PrismaClient = prisma
): Promise<(RiskProfileV1 & { input: RiskInputV1 }) | null> {
  const computed = await buildRiskInputFromDatabaseV1(auditId, db);
  if (!computed) {
    return null;
  }

  return {
    ...calculateRiskProfileV1(computed.input),
    input: computed.input,
  };
}
