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
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative py-16 sm:py-20 bg-slate-950 overflow-hidden scan-lines"
      id="quick-check"
    >
      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-56 w-56 rounded-full bg-rose-500/8 blur-[100px]" />
      </div>
      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-40" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gradient-cyan mb-2">
              {t("title")}
            </h2>
            <p className="text-slate-400">{t("subtitle")}</p>
          </div>

          {/* Animated border wrapper */}
          <div className="animated-border rounded-xl p-px">
            {/* Glass card inner */}
            <div className="glass-card rounded-xl">
              {/* Card header area */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-500 font-mono text-sm">
                    {t("question", {
                      current: currentIndex + 1,
                      total: questions.length,
                    })}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
                    {tCategories(current.category.id)}
                  </span>
                </div>
                {/* Custom progress bar */}
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-cyan-500"
                    style={{ boxShadow: "0 0 12px rgba(34, 211, 238, 0.4)" }}
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Question + answers area */}
              <div className="px-6 pb-6">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentIndex}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -40 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <h3 className="text-lg font-semibold text-white mt-4 mb-5 leading-relaxed">
                      {current.question.text[locale as "de" | "en"]}
                    </h3>

                    <div className="space-y-3">
                      {answerOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleAnswer(option.value)}
                          className={`w-full flex items-center gap-3 rounded-lg border p-4 text-left transition-all duration-200 ${
                            currentAnswer === option.value
                              ? option.selectedColor
                              : "border-slate-700/50 bg-slate-900/50 text-slate-300 hover:border-slate-600"
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
                    className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ boxShadow: currentAnswer ? "0 0 20px rgba(34, 211, 238, 0.3), 0 0 60px rgba(34, 211, 238, 0.1)" : "none" }}
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
        </div>
      </div>
    </motion.section>
  );
}
