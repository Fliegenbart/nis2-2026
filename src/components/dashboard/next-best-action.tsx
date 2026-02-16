"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { NIS2Category, AnswerValue } from "@/data/nis2-framework";

interface NextBestActionProps {
  categories: NIS2Category[];
  answers: Map<string, AnswerValue>;
  auditId: string;
}

export function NextBestAction({
  categories,
  answers,
  auditId,
}: NextBestActionProps) {
  const locale = useLocale();
  const t = useTranslations("dashboard");

  // Find the first category that has unanswered critical questions
  // or has "not_fulfilled" critical answers
  const targetCategory = categories.find((category) => {
    return category.questions.some((q) => {
      if (q.severity !== "kritisch") return false;
      const answer = answers.get(q.id);
      return !answer || answer === "not_fulfilled";
    });
  });

  if (!targetCategory) return null;

  const hasAnyAnswers = targetCategory.questions.some((q) => answers.has(q.id));
  const categoryName = targetCategory.name[locale as "de" | "en"];
  const actionLabel = hasAnyAnswers ? t("continueAudit") : t("startAudit");

  return (
    <Card className="border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950">
      <CardHeader>
        <CardTitle className="text-indigo-900 dark:text-indigo-100">
          {t("nextAction")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-indigo-700 dark:text-indigo-300">
          {t("nextActionDescription")}:{" "}
          <span className="font-semibold">{categoryName}</span>
        </p>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white">
          <Link href={`/${locale}/audit/${auditId}/category/${targetCategory.id}`}>
            {actionLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
