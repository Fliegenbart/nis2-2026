"use client";

import { useTranslations, useLocale } from "next-intl";
import { Lock, CheckCircle, XCircle, MinusCircle } from "lucide-react";
import { QUICK_CHECK_QUESTION_IDS, getQuestionById } from "@/data/nis2-framework";
import type { AnswerValue } from "@/data/nis2-framework";

interface QuickCheckResultsProps {
  answers: Record<string, AnswerValue>;
  onUnlock: () => void;
}

const answerIcons: Record<string, React.ReactNode> = {
  fulfilled: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  partial: <MinusCircle className="h-5 w-5 text-amber-500" />,
  not_fulfilled: <XCircle className="h-5 w-5 text-rose-500" />,
};

export function QuickCheckResults({ answers, onUnlock }: QuickCheckResultsProps) {
  const t = useTranslations("landing.results");
  const locale = useLocale();

  const questions = QUICK_CHECK_QUESTION_IDS.map((id) => getQuestionById(id)!);
  const fulfilledCount = Object.values(answers).filter(
    (v) => v === "fulfilled"
  ).length;
  const score = Math.round((fulfilledCount / questions.length) * 100);

  return (
    <div className="mx-auto max-w-2xl" id="results">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">{t("title")}</h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_36px_-30px_rgba(15,23,42,0.28)]">
        <div className="bg-slate-900 text-center py-10">
          <p className="text-5xl font-extrabold text-cyan-300">{score}%</p>
          <p className="mt-2 text-slate-300">Quick-Check Score</p>
        </div>

        <div className="space-y-3 p-6">
          {questions.map((question) => (
            <div
              key={question.id}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              {answerIcons[answers[question.id]] || answerIcons.not_fulfilled}
              <span className="flex-1 text-sm text-slate-700">
                {question.text[locale as "de" | "en"]}
              </span>
            </div>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-transparent" />
          <div className="relative flex flex-col items-center gap-4 px-6 pb-8 pt-16">
            <div className="relative">
              <Lock className="h-8 w-8 text-slate-500" />
            </div>
            <p className="text-center font-semibold text-slate-700">{t("locked")}</p>
            <button
              onClick={onUnlock}
              className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition-colors hover:bg-cyan-400"
            >
              {t("unlockCta")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
