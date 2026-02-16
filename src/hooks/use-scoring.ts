"use client";

import { useMemo, useCallback } from "react";
import type { AnswerValue } from "@/data/nis2-framework";
import { NIS2_CATEGORIES } from "@/data/nis2-framework";
import {
  calculateAllCategoryScores,
  calculateOverallScore,
  type CategoryScore,
} from "@/lib/scoring";

export function useScoring(answers: Map<string, AnswerValue>) {
  const categoryScores = useMemo<CategoryScore[]>(
    () => calculateAllCategoryScores(answers, NIS2_CATEGORIES),
    [answers]
  );

  const overallScore = useMemo<number>(
    () => calculateOverallScore(categoryScores),
    [categoryScores]
  );

  const getCategoryScore = useCallback(
    (categoryId: string): CategoryScore | undefined => {
      return categoryScores.find((s) => s.categoryId === categoryId);
    },
    [categoryScores]
  );

  return {
    overallScore,
    categoryScores,
    getCategoryScore,
  };
}
