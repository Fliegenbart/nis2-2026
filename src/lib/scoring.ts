import type {
  Severity,
  AnswerValue,
  NIS2Question,
  NIS2Category,
} from "@/data/nis2-framework";
import { ANSWER_WEIGHT, SEVERITY_WEIGHT } from "@/lib/audit-methodology";

export interface ControlScore {
  questionId: string;
  categoryId: string;
  severity: Severity;
  answer: AnswerValue | null;
  answered: boolean;
  weightedEarned: number;
  weightedMax: number;
  isGap: boolean;
  isCriticalGap: boolean;
}

export interface CategoryScore {
  categoryId: string;
  score: number;
  answeredCount: number;
  totalCount: number;
  weightedEarned: number;
  weightedMax: number;
  completionRate: number;
  gapCount: number;
  criticalGapCount: number;
}

export interface AuditScoreV2 {
  overallScore: number;
  coverageRate: number;
  categoryScores: CategoryScore[];
  controlScores: ControlScore[];
  gapCount: number;
  criticalGapCount: number;
}

export function getSeverityWeight(severity: Severity): number {
  return SEVERITY_WEIGHT[severity];
}

function toAnsweredWeight(answer: AnswerValue): number | null {
  return ANSWER_WEIGHT[answer];
}

export function scoreControl(
  answer: AnswerValue | null,
  question: NIS2Question,
  categoryId: string
): ControlScore {
  const weight = SEVERITY_WEIGHT[question.severity];
  const answerWeight = answer ? toAnsweredWeight(answer) : null;
  const answered = answerWeight !== null;
  const weightedMax = answered ? weight : 0;
  const weightedEarned = answered ? weight * answerWeight : 0;
  const isGap = answered && answer !== "fulfilled";
  const isCriticalGap = isGap && question.severity === "kritisch";

  return {
    questionId: question.id,
    categoryId,
    severity: question.severity,
    answer,
    answered,
    weightedEarned,
    weightedMax,
    isGap,
    isCriticalGap,
  };
}

export function calculateCategoryScore(
  answers: Map<string, AnswerValue>,
  questions: NIS2Question[]
): number {
  let earned = 0;
  let max = 0;

  for (const question of questions) {
    const control = scoreControl(answers.get(question.id) ?? null, question, "unknown");
    earned += control.weightedEarned;
    max += control.weightedMax;
  }

  if (max === 0) return 0;
  return Math.round((earned / max) * 100);
}

function calculateCategoryScoreV2(
  answers: Map<string, AnswerValue>,
  category: NIS2Category
): { categoryScore: CategoryScore; controls: ControlScore[] } {
  const controls = category.questions.map((question) =>
    scoreControl(answers.get(question.id) ?? null, question, category.id)
  );

  const weightedEarned = controls.reduce((sum, c) => sum + c.weightedEarned, 0);
  const weightedMax = controls.reduce((sum, c) => sum + c.weightedMax, 0);
  const answeredCount = controls.filter((c) => c.answered).length;
  const gapCount = controls.filter((c) => c.isGap).length;
  const criticalGapCount = controls.filter((c) => c.isCriticalGap).length;

  const score = weightedMax > 0 ? Math.round((weightedEarned / weightedMax) * 100) : 0;
  const completionRate =
    category.questions.length > 0
      ? Math.round((answeredCount / category.questions.length) * 100)
      : 0;

  return {
    categoryScore: {
      categoryId: category.id,
      score,
      answeredCount,
      totalCount: category.questions.length,
      weightedEarned,
      weightedMax,
      completionRate,
      gapCount,
      criticalGapCount,
    },
    controls,
  };
}

export function calculateAllCategoryScores(
  answers: Map<string, AnswerValue>,
  categories: NIS2Category[]
): CategoryScore[] {
  return categories.map((category) =>
    calculateCategoryScoreV2(answers, category).categoryScore
  );
}

export function calculateOverallScore(categoryScores: CategoryScore[]): number {
  const weightedEarned = categoryScores.reduce((sum, c) => sum + c.weightedEarned, 0);
  const weightedMax = categoryScores.reduce((sum, c) => sum + c.weightedMax, 0);
  return weightedMax > 0 ? Math.round((weightedEarned / weightedMax) * 100) : 0;
}

export function calculateAuditScoreV2(
  answers: Map<string, AnswerValue>,
  categories: NIS2Category[]
): AuditScoreV2 {
  const categoryResults = categories.map((category) =>
    calculateCategoryScoreV2(answers, category)
  );
  const categoryScores = categoryResults.map((r) => r.categoryScore);
  const controlScores = categoryResults.flatMap((r) => r.controls);

  const overallScore = calculateOverallScore(categoryScores);
  const totalControls = controlScores.length;
  const answeredControls = controlScores.filter((c) => c.answered).length;
  const coverageRate =
    totalControls > 0 ? Math.round((answeredControls / totalControls) * 100) : 0;
  const gapCount = controlScores.filter((c) => c.isGap).length;
  const criticalGapCount = controlScores.filter((c) => c.isCriticalGap).length;

  return {
    overallScore,
    coverageRate,
    categoryScores,
    controlScores,
    gapCount,
    criticalGapCount,
  };
}

export function getScoreColor(score: number): string {
  if (score <= 33) return "#e11d48";
  if (score <= 66) return "#f59e0b";
  return "#10b981";
}

export function getScoreLabel(score: number, locale: string): string {
  if (score <= 33) return locale === "de" ? "Kritisch" : "Critical";
  if (score <= 66) return locale === "de" ? "Verbesserungsbedarf" : "Needs Improvement";
  return locale === "de" ? "Gut" : "Good";
}
