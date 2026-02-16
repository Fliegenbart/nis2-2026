"use client";

import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComplianceScoreChart } from "@/components/dashboard/compliance-score-chart";
import { LiabilityTicker } from "@/components/dashboard/liability-ticker";
import { CategoryProgressGrid } from "@/components/dashboard/category-progress-grid";
import { NextBestAction } from "@/components/dashboard/next-best-action";
import { useAudit } from "@/hooks/use-audit";
import { useScoring } from "@/hooks/use-scoring";
import { NIS2_CATEGORIES } from "@/data/nis2-framework";
import Link from "next/link";

export default function DashboardPage() {
  const params = useParams();
  const auditId = params.auditId as string;
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const { answers, isLoading, auditData } = useAudit(auditId);
  const { overallScore, categoryScores } = useScoring(answers);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Shield className="h-12 w-12 text-indigo-600 animate-pulse" />
          <p className="text-slate-500">{t("title")}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t("title")}</h1>
          {auditData?.companyName && (
            <p className="text-slate-500 mt-1">{auditData.companyName}</p>
          )}
        </div>
        <Link href={`/${locale}/audit/${auditId}/report`}>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            {t("downloadReport")}
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-1">
          <ComplianceScoreChart score={overallScore} />
        </div>
        <div className="lg:col-span-1">
          <LiabilityTicker
            revenue={auditData?.revenue || 0}
            score={overallScore}
          />
        </div>
        <div className="lg:col-span-1">
          <NextBestAction
            categories={NIS2_CATEGORIES}
            answers={answers}
            auditId={auditId}
          />
        </div>
      </div>

      <CategoryProgressGrid
        categories={NIS2_CATEGORIES}
        categoryScores={categoryScores}
        auditId={auditId}
      />
    </div>
  );
}
