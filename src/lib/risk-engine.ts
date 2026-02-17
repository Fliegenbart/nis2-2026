import { calculateMaxFine } from "@/lib/fine-calculator";

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
