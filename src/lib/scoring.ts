import type { Severity, AnswerValue, NIS2Question, NIS2Category } from "@/data/nis2-framework";

const SEVERITY_WEIGHTS: Record<Severity, number> = {
  kritisch: 3,
  hoch: 2,
  mittel: 1,
};

const ANSWER_SCORES: Record<AnswerValue, number> = {
  fulfilled: 1.0,
  partial: 0.5,
  not_fulfilled: 0.0,
  not_applicable: -1, // excluded from calculation
};

export function getSeverityWeight(severity: Severity): number {
  return SEVERITY_WEIGHTS[severity];
}

export interface CategoryScore {
  categoryId: string;
  score: number;
  answeredCount: number;
  totalCount: number;
}

export function calculateCategoryScore(
  answers: Map<string, AnswerValue>,
  questions: NIS2Question[]
): number {
  let weightedScore = 0;
  let maxWeightedScore = 0;

  for (const question of questions) {
    const answer = answers.get(question.id);
    if (!answer || answer === "not_applicable") continue;

    const weight = SEVERITY_WEIGHTS[question.severity];
    weightedScore += ANSWER_SCORES[answer] * weight;
    maxWeightedScore += weight;
  }

  if (maxWeightedScore === 0) return 0;
  return Math.round((weightedScore / maxWeightedScore) * 100);
}

export function calculateOverallScore(categoryScores: CategoryScore[]): number {
  const totalWeight = categoryScores.reduce(
    (sum, c) => sum + c.totalCount,
    0
  );
  const weightedSum = categoryScores.reduce(
    (sum, c) => sum + c.score * c.totalCount,
    0
  );
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

export function calculateAllCategoryScores(
  answers: Map<string, AnswerValue>,
  categories: NIS2Category[]
): CategoryScore[] {
  return categories.map((category) => {
    const answeredCount = category.questions.filter((q) => {
      const a = answers.get(q.id);
      return a && a !== "not_applicable";
    }).length;

    return {
      categoryId: category.id,
      score: calculateCategoryScore(answers, category.questions),
      answeredCount,
      totalCount: category.questions.length,
    };
  });
}

export function getScoreColor(score: number): string {
  if (score <= 33) return "#e11d48"; // Rose-600
  if (score <= 66) return "#f59e0b"; // Amber-500
  return "#10b981"; // Emerald-500
}

export function getScoreLabel(
  score: number,
  locale: string
): string {
  if (score <= 33)
    return locale === "de" ? "Kritisch" : "Critical";
  if (score <= 66)
    return locale === "de" ? "Verbesserungsbedarf" : "Needs Improvement";
  return locale === "de" ? "Gut" : "Good";
}
