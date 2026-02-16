"use client";

import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuestionCard } from "@/components/audit/question-card";
import { CategorySidebar } from "@/components/audit/category-sidebar";
import { AuditStepper } from "@/components/audit/audit-stepper";
import { PaywallModal } from "@/components/audit/paywall-modal";
import { useAudit } from "@/hooks/use-audit";
import { useScoring } from "@/hooks/use-scoring";
import { NIS2_CATEGORIES, getCategoryById } from "@/data/nis2-framework";
import Link from "next/link";
import { useState, useEffect } from "react";

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
  const [showPaywall, setShowPaywall] = useState(false);

  const category = getCategoryById(categoryId);
  const categoryIndex = NIS2_CATEGORIES.findIndex((c) => c.id === categoryId);
  const prevCategory = categoryIndex > 0 ? NIS2_CATEGORIES[categoryIndex - 1] : null;
  const nextCategory = categoryIndex < NIS2_CATEGORIES.length - 1 ? NIS2_CATEGORIES[categoryIndex + 1] : null;

  useEffect(() => {
    if (category && !category.isFree) {
      setShowPaywall(true);
    }
  }, [category]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Shield className="h-12 w-12 text-indigo-600 animate-pulse" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-slate-500">Category not found</p>
      </div>
    );
  }

  const answeredCount = category.questions.filter((q) => answers.has(q.id)).length;
  const progress = (answeredCount / category.questions.length) * 100;

  return (
    <>
      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <AuditStepper
            categories={NIS2_CATEGORIES}
            currentCategoryId={categoryId}
            categoryScores={categoryScores}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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
                <h1 className="text-2xl font-bold text-slate-900">
                  {tCategories(category.id)}
                </h1>
                <span className="text-sm text-slate-500">
                  {isSaving ? t("saving") : t("saveStatus")}
                </span>
              </div>
              <p className="text-slate-600 mb-4">
                {category.description[locale as "de" | "en"]}
              </p>
              <div className="flex items-center gap-3">
                <Progress value={progress} className="h-2 flex-1" />
                <span className="text-sm font-medium text-slate-700">
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
            <div className="flex justify-between mt-8 pt-6 border-t">
              {prevCategory ? (
                <Link href={`/${locale}/audit/${auditId}/category/${prevCategory.id}`}>
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {t("prevCategory")}
                  </Button>
                </Link>
              ) : (
                <Link href={`/${locale}/audit/${auditId}/dashboard`}>
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {t("backToDashboard")}
                  </Button>
                </Link>
              )}

              {nextCategory ? (
                <Link href={`/${locale}/audit/${auditId}/category/${nextCategory.id}`}>
                  <Button className="gap-2 bg-indigo-600 hover:bg-indigo-500">
                    {t("nextCategory")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href={`/${locale}/audit/${auditId}/report`}>
                  <Button className="gap-2 bg-indigo-600 hover:bg-indigo-500">
                    {tDashboard("downloadReport")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        categoryName={tCategories(category.id)}
      />
    </>
  );
}
