import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateAllCategoryScores,
  calculateAuditScoreV2,
  calculateOverallScore,
} from "../src/lib/scoring";
import { calculateRiskProfileV1 } from "../src/lib/risk-engine";
import type { AnswerValue, NIS2Category } from "../src/data/nis2-framework";

const categories: NIS2Category[] = [
  {
    id: "cat-a",
    name: { de: "A", en: "A" },
    description: { de: "", en: "" },
    articleRef: "Art. 1",
    icon: "Shield",
    isFree: true,
    questions: [
      {
        id: "q-critical",
        text: { de: "", en: "" },
        helpText: { de: "", en: "" },
        recommendation: { de: "", en: "" },
        severity: "kritisch",
        legalReference: "Art. 1",
      },
      {
        id: "q-medium",
        text: { de: "", en: "" },
        helpText: { de: "", en: "" },
        recommendation: { de: "", en: "" },
        severity: "mittel",
        legalReference: "Art. 1",
      },
    ],
  },
  {
    id: "cat-b",
    name: { de: "B", en: "B" },
    description: { de: "", en: "" },
    articleRef: "Art. 2",
    icon: "Shield",
    isFree: true,
    questions: [
      {
        id: "q-high",
        text: { de: "", en: "" },
        helpText: { de: "", en: "" },
        recommendation: { de: "", en: "" },
        severity: "hoch",
        legalReference: "Art. 2",
      },
    ],
  },
];

function mapAnswers(entries: Array<[string, AnswerValue]>): Map<string, AnswerValue> {
  return new Map(entries);
}

test("scoring v2 uses severity weighting and not_applicable exclusion", () => {
  const answers = mapAnswers([
    ["q-critical", "partial"],
    ["q-medium", "not_applicable"],
    ["q-high", "fulfilled"],
  ]);

  const categoryScores = calculateAllCategoryScores(answers, categories);
  const overallScore = calculateOverallScore(categoryScores);

  const catA = categoryScores.find((c) => c.categoryId === "cat-a");
  assert.ok(catA);
  assert.equal(catA.weightedMax, 5);
  assert.equal(catA.weightedEarned, 2.5);
  assert.equal(catA.score, 50);
  assert.equal(catA.answeredCount, 1);

  const catB = categoryScores.find((c) => c.categoryId === "cat-b");
  assert.ok(catB);
  assert.equal(catB.score, 100);

  assert.equal(overallScore, 69);
});

test("audit score model returns coverage and gap counters", () => {
  const answers = mapAnswers([
    ["q-critical", "not_fulfilled"],
    ["q-medium", "partial"],
  ]);

  const score = calculateAuditScoreV2(answers, categories);

  assert.equal(score.coverageRate, 67);
  assert.equal(score.gapCount, 2);
  assert.equal(score.criticalGapCount, 1);
  assert.equal(score.overallScore, 8);
});

test("risk engine escalates based on exposure and gaps", () => {
  const risk = calculateRiskProfileV1({
    overallScore: 60,
    gapCount: 13,
    criticalGapCount: 3,
    revenue: 120_000_000,
    employeeCount: 400,
  });

  assert.equal(risk.level, "critical");
  assert.equal(risk.potentialFine, 10_000_000);
  assert.ok(risk.confidence >= 0.8);
  assert.ok(risk.rationale.length >= 3);
});
