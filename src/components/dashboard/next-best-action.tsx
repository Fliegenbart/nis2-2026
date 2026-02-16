"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
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
    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 glow-cyan p-6">
      <div className="mb-4">
        <h3 className="text-white font-bold text-lg">
          {t("nextAction")}
        </h3>
      </div>
      <div>
        <p className="mb-4 text-slate-400 text-sm">
          {t("nextActionDescription")}:{" "}
          <span className="text-cyan-400 font-semibold">{categoryName}</span>
        </p>
        <Button asChild className="bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
          <Link href={`/${locale}/audit/${auditId}/category/${targetCategory.id}`}>
            {actionLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
