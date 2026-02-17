import { NIS2_CATEGORIES } from "@/data/nis2-framework";
import {
  FRAMEWORK_VERSION,
  METHODOLOGY_VERSION,
  SEVERITY_WEIGHT,
} from "@/lib/audit-methodology";

export interface ControlCatalogEntry {
  frameworkVersion: string;
  methodologyVersion: string;
  categoryId: string;
  questionId: string;
  severity: "kritisch" | "hoch" | "mittel";
  weight: number;
  articleRef: string;
  legalReference: string;
  evidenceRequired: boolean;
}

export function buildControlCatalog(): ControlCatalogEntry[] {
  return NIS2_CATEGORIES.flatMap((category) =>
    category.questions.map((question) => ({
      frameworkVersion: FRAMEWORK_VERSION,
      methodologyVersion: METHODOLOGY_VERSION,
      categoryId: category.id,
      questionId: question.id,
      severity: question.severity,
      weight: SEVERITY_WEIGHT[question.severity],
      articleRef: category.articleRef,
      legalReference: question.legalReference,
      evidenceRequired: question.severity !== "mittel",
    }))
  );
}
