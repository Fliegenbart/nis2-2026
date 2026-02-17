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
  const partialCount = Object.values(answers).filter((v) => v === "partial").length;
  const notFulfilledCount = Object.values(answers).filter(
    (v) => v === "not_fulfilled"
  ).length;
  const score = Math.round((fulfilledCount / questions.length) * 100);
  const riskLabel =
    score >= 75
      ? locale === "de"
        ? "Niedriges Risiko"
        : "Lower risk"
      : score >= 45
        ? locale === "de"
          ? "Mittleres Risiko"
          : "Moderate risk"
        : locale === "de"
          ? "Hohes Risiko"
          : "Higher risk";
  const riskTone =
    score >= 75
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : score >= 45
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <div className="mx-auto max-w-3xl" id="results">
      <div className="mb-8 text-center">
        <p className="landing-eyebrow">{locale === "de" ? "Ergebnis-Vorschau" : "Result preview"}</p>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t("title")}</h2>
      </div>

      <div className="landing-card overflow-hidden">
        <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#f8fcff_0%,#f1f7ff_100%)] px-6 py-7 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {locale === "de" ? "Quick-Check Score" : "Quick check score"}
              </p>
              <p className="mt-1 text-5xl font-black tracking-tight text-slate-900">{score}%</p>
            </div>
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${riskTone}`}>
              {riskLabel}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-emerald-200 bg-white px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {locale === "de" ? "Erfüllt" : "Fulfilled"}
              </p>
              <p className="mt-1 text-lg font-bold text-emerald-700">{fulfilledCount}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-white px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {locale === "de" ? "Teilweise" : "Partial"}
              </p>
              <p className="mt-1 text-lg font-bold text-amber-700">{partialCount}</p>
            </div>
            <div className="rounded-lg border border-rose-200 bg-white px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {locale === "de" ? "Offen" : "Open gaps"}
              </p>
              <p className="mt-1 text-lg font-bold text-rose-700">{notFulfilledCount}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-6 sm:p-8">
          {questions.map((question) => (
            <div
              key={question.id}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5"
            >
              {answerIcons[answers[question.id]] || answerIcons.not_fulfilled}
              <span className="flex-1 text-sm text-slate-700">
                {question.text[locale as "de" | "en"]}
              </span>
            </div>
          ))}
        </div>

        <div className="relative border-t border-slate-200 bg-slate-50/60">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-transparent" />
          <div className="relative flex flex-col items-center gap-4 px-6 pb-9 pt-14">
            <div className="relative">
              <Lock className="h-8 w-8 text-slate-500" />
            </div>
            <p className="text-center font-semibold text-slate-700">{t("locked")}</p>
            <button
              onClick={onUnlock}
              className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-6 py-3 text-sm font-extrabold text-slate-950 transition-colors hover:bg-cyan-400"
            >
              {t("unlockCta")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
