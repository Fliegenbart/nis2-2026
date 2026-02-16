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
  const [direction, setDirection] = useState(1);

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
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    } else {
      onComplete(answers);
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  }

  const answerOptions: { value: AnswerValue; label: string; icon: React.ReactNode; selectedColor: string }[] = [
    {
      value: "fulfilled",
      label: tAudit("fulfilled"),
      icon: <CheckCircle className="h-5 w-5" />,
      selectedColor: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
    },
    {
      value: "partial",
      label: tAudit("partial"),
      icon: <MinusCircle className="h-5 w-5" />,
      selectedColor: "border-amber-500/50 bg-amber-500/10 text-amber-400",
    },
    {
      value: "not_fulfilled",
      label: tAudit("notFulfilled"),
      icon: <XCircle className="h-5 w-5" />,
      selectedColor: "border-rose-500/50 bg-rose-500/10 text-rose-400",
    },
  ];

  return (
    <section
      className="relative py-16 sm:py-20 bg-slate-950"
      id="quick-check"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gradient-cyan mb-2">
              {t("title")}
            </h2>
            <p className="text-slate-400">{t("subtitle")}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
            {/* Card header area */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">
                  {t("question", {
                    current: currentIndex + 1,
                    total: questions.length,
                  })}
                </span>
                <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
                  {tCategories(current.category.id)}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 w-full rounded-full bg-slate-800">
                <motion.div
                  className="h-full rounded-full bg-cyan-500"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Question + answers area */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <h3 className="text-lg font-bold text-white mb-5 leading-relaxed">
                  {current.question.text[locale as "de" | "en"]}
                </h3>

                <div className="space-y-3">
                  {answerOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                        currentAnswer === option.value
                          ? `${option.selectedColor} border-cyan-500 bg-cyan-500/10`
                          : "border-slate-700/50 bg-slate-800/50 text-slate-300 hover:border-cyan-500/50"
                      }`}
                    >
                      {option.icon}
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between pt-6">
              <button
                onClick={handleBack}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("back")}
              </button>
              <button
                onClick={handleNext}
                disabled={!currentAnswer}
                className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg px-6 py-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
      </div>
    </section>
  );
}
