"use client";

import { useTranslations, useLocale } from "next-intl";
import { Lock, CheckCircle, XCircle, MinusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <section className="py-16 sm:py-20 bg-slate-50" id="results">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {t("title")}
            </h2>
          </div>

          <Card className="shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-900 text-white text-center py-8">
              <CardTitle className="text-5xl font-extrabold">{score}%</CardTitle>
              <p className="text-slate-300 mt-2">Quick-Check Score</p>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  {answerIcons[answers[question.id]] || answerIcons.not_fulfilled}
                  <span className="text-sm text-slate-700 flex-1">
                    {question.text[locale as "de" | "en"]}
                  </span>
                </div>
              ))}
            </CardContent>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-transparent" />
              <div className="relative flex flex-col items-center gap-4 px-6 pb-8 pt-16">
                <Lock className="h-8 w-8 text-slate-400" />
                <p className="text-center font-semibold text-slate-700">
                  {t("locked")}
                </p>
                <Button
                  size="lg"
                  onClick={onUnlock}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  {t("unlockCta")}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
