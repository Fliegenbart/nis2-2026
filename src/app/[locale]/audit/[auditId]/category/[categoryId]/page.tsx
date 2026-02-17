"use client";

import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/audit/question-card";
import { CategorySidebar } from "@/components/audit/category-sidebar";
import { AuditStepper } from "@/components/audit/audit-stepper";
import { PaywallModal } from "@/components/audit/paywall-modal";
import { useAudit } from "@/hooks/use-audit";
import { useScoring } from "@/hooks/use-scoring";
import { NIS2_CATEGORIES, getCategoryById } from "@/data/nis2-framework";
import Link from "next/link";
import { useState } from "react";

export default function CategoryAuditPage() {
  const params = useParams();
  const auditId = params.auditId as string;
  const categoryId = params.categoryId as string;
  const locale = useLocale();
  const t = useTranslations("audit");
  const tDashboard = useTranslations("dashboard");
  const tCategories = useTranslations("categories");

  const { answers, setAnswer, isLoading, isSaving } = useAudit(auditId);
  const { categoryScores } = useScoring(answers);
  const [closedPaywallCategoryId, setClosedPaywallCategoryId] = useState<string | null>(null);

  const category = getCategoryById(categoryId);
  const categoryIndex = NIS2_CATEGORIES.findIndex((c) => c.id === categoryId);
  const prevCategory = categoryIndex > 0 ? NIS2_CATEGORIES[categoryIndex - 1] : null;
  const nextCategory = categoryIndex < NIS2_CATEGORIES.length - 1 ? NIS2_CATEGORIES[categoryIndex + 1] : null;
  const showPaywall = Boolean(
    category && !category.isFree && closedPaywallCategoryId !== category.id
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-slate-950">
        <Shield className="h-12 w-12 text-cyan-400 animate-pulse" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-20 text-center bg-slate-950 min-h-screen">
        <p className="text-slate-400">Category not found</p>
      </div>
    );
  }

  const answeredCount = category.questions.filter((q) => answers.has(q.id)).length;
  const progress = (answeredCount / category.questions.length) * 100;

  return (
    <>
      <div className="border-b border-slate-800 bg-slate-950">
        <div className="container mx-auto px-4">
          <AuditStepper
            categories={NIS2_CATEGORIES}
            currentCategoryId={categoryId}
            categoryScores={categoryScores}
          />
        </div>
      </div>

      <div className="min-h-screen bg-slate-950 relative">
        {/* Background texture layers */}
        <div className="scan-lines absolute inset-0 pointer-events-none" />
        <div className="dot-grid opacity-30 absolute inset-0 pointer-events-none" />

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex gap-8">
            {/* Sidebar - hidden on mobile */}
            <aside className="hidden lg:block w-72 shrink-0">
              <CategorySidebar
                categories={NIS2_CATEGORIES}
                currentCategoryId={categoryId}
                categoryScores={categoryScores}
                auditId={auditId}
              />
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold text-white">
                    {tCategories(category.id)}
                  </h1>
                  <span className="text-sm text-slate-500">
                    {isSaving ? t("saving") : t("saveStatus")}
                  </span>
                </div>
                <p className="text-slate-400 mb-4">
                  {category.description[locale as "de" | "en"]}
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-2 rounded-full bg-slate-800 flex-1">
                    <div
                      className="bg-cyan-500 rounded-full transition-all h-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-slate-400 font-mono text-sm">
                    {answeredCount}/{category.questions.length}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {category.questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    answer={answers.get(question.id)}
                    onAnswer={(value) =>
                      setAnswer(question.id, category.id, value)
                    }
                    locale={locale}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
                {prevCategory ? (
                  <Link href={`/${locale}/audit/${auditId}/category/${prevCategory.id}`}>
                    <Button variant="outline" className="gap-2 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 bg-transparent">
                      <ArrowLeft className="h-4 w-4" />
                      {t("prevCategory")}
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/${locale}/audit/${auditId}/dashboard`}>
                    <Button variant="outline" className="gap-2 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 bg-transparent">
                      <ArrowLeft className="h-4 w-4" />
                      {t("backToDashboard")}
                    </Button>
                  </Link>
                )}

                {nextCategory ? (
                  <Link href={`/${locale}/audit/${auditId}/category/${nextCategory.id}`}>
                    <Button className="gap-2 bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                      {t("nextCategory")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/${locale}/audit/${auditId}/report`}>
                    <Button className="gap-2 bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                      {tDashboard("downloadReport")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setClosedPaywallCategoryId(category?.id ?? null)}
        categoryName={tCategories(category.id)}
      />
    </>
  );
}
