"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle, XCircle, MinusCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { QUICK_CHECK_QUESTION_IDS, getQuestionById, getCategoryForQuestion } from "@/data/nis2-framework";
import type { AnswerValue } from "@/data/nis2-framework";
import { motion, AnimatePresence } from "motion/react";

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

  const answerOptions: {
    value: AnswerValue;
    label: string;
    icon: React.ReactNode;
    selectedColor: string;
  }[] = [
    {
      value: "fulfilled",
      label: tAudit("fulfilled"),
      icon: <CheckCircle className="h-5 w-5" />,
      selectedColor: "border-emerald-300 bg-emerald-50 text-emerald-800",
    },
    {
      value: "partial",
      label: tAudit("partial"),
      icon: <MinusCircle className="h-5 w-5" />,
      selectedColor: "border-amber-300 bg-amber-50 text-amber-800",
    },
    {
      value: "not_fulfilled",
      label: tAudit("notFulfilled"),
      icon: <XCircle className="h-5 w-5" />,
      selectedColor: "border-rose-300 bg-rose-50 text-rose-800",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl" id="quick-check">
      <div className="mb-8 text-center">
        <p className="landing-eyebrow">{locale === "de" ? "Audit Snapshot" : "Audit Snapshot"}</p>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t("title")}</h2>
        <p className="mt-3 text-slate-600">{t("subtitle")}</p>
      </div>

      <div className="landing-card p-6 sm:p-8">
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              {t("question", {
                current: currentIndex + 1,
                total: questions.length,
              })}
            </span>
            <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
              {tCategories(current.category.id)}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-cyan-500"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <h3 className="text-lg font-bold leading-relaxed text-slate-900">
                {current.question.text[locale as "de" | "en"]}
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {answerOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full cursor-pointer rounded-xl border p-4 text-left transition-colors duration-200 ${
                    currentAnswer === option.value
                      ? option.selectedColor
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {option.icon}
                    <span className="font-medium">{option.label}</span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between pt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!currentAnswer}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {currentIndex === questions.length - 1
              ? t("finish")
              : t("next")}
            {currentIndex < questions.length - 1 && (
              <ArrowRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
