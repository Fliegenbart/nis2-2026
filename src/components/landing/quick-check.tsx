"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle, XCircle, MinusCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { QUICK_CHECK_QUESTION_IDS, getQuestionById, getCategoryForQuestion } from "@/data/nis2-framework";
import type { AnswerValue } from "@/data/nis2-framework";

interface QuickCheckProps {
  onComplete: (answers: Record<string, AnswerValue>) => void;
}

export function QuickCheck({ onComplete }: QuickCheckProps) {
  const t = useTranslations("landing.quickCheck");
  const tAudit = useTranslations("audit");
  const tCategories = useTranslations("categories");
  const locale = useLocale();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});

  const questions = QUICK_CHECK_QUESTION_IDS.map((id) => ({
    question: getQuestionById(id)!,
    category: getCategoryForQuestion(id)!,
  }));

  const current = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const currentAnswer = answers[current.question.id];

  function handleAnswer(value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [current.question.id]: value }));
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onComplete(answers);
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }

  const answerOptions: { value: AnswerValue; label: string; icon: React.ReactNode; color: string }[] = [
    {
      value: "fulfilled",
      label: tAudit("fulfilled"),
      icon: <CheckCircle className="h-5 w-5" />,
      color: "border-emerald-500 bg-emerald-50 text-emerald-700",
    },
    {
      value: "partial",
      label: tAudit("partial"),
      icon: <MinusCircle className="h-5 w-5" />,
      color: "border-amber-500 bg-amber-50 text-amber-700",
    },
    {
      value: "not_fulfilled",
      label: tAudit("notFulfilled"),
      icon: <XCircle className="h-5 w-5" />,
      color: "border-rose-500 bg-rose-50 text-rose-700",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-50" id="quick-check">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {t("title")}
            </h2>
            <p className="text-slate-600">{t("subtitle")}</p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardDescription>
                  {t("question", {
                    current: currentIndex + 1,
                    total: questions.length,
                  })}
                </CardDescription>
                <Badge variant="secondary">
                  {tCategories(current.category.id)}
                </Badge>
              </div>
              <Progress value={progress} className="h-2" />
              <CardTitle className="text-lg mt-4 leading-relaxed">
                {current.question.text[locale as "de" | "en"]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {answerOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${
                    currentAnswer === option.value
                      ? option.color
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  {option.icon}
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}

              <div className="flex justify-between pt-4">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentIndex === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("back")}
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!currentAnswer}
                >
                  {currentIndex === questions.length - 1
                    ? t("finish")
                    : t("next")}
                  {currentIndex < questions.length - 1 && (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
