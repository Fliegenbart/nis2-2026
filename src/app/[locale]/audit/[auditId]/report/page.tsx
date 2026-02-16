"use client";

import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Download, FileText, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAudit } from "@/hooks/use-audit";
import { useScoring } from "@/hooks/use-scoring";
import { NIS2_CATEGORIES } from "@/data/nis2-framework";
import { getScoreColor, getScoreLabel } from "@/lib/scoring";
import { useState } from "react";
import Link from "next/link";

export default function ReportPage() {
  const params = useParams();
  const auditId = params.auditId as string;
  const locale = useLocale();
  const t = useTranslations("report");
  const tCategories = useTranslations("categories");
  const tAudit = useTranslations("audit");
  const { answers, isLoading, auditData } = useAudit(auditId);
  const { overallScore, categoryScores } = useScoring(answers);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/report/${auditId}`);
      if (!res.ok) throw new Error("Failed to generate report");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nis2-audit-report-${auditId.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Shield className="h-12 w-12 text-indigo-600 animate-pulse" />
      </div>
    );
  }

  const gapItems = NIS2_CATEGORIES.flatMap((category) =>
    category.questions
      .filter((q) => answers.get(q.id) === "not_fulfilled")
      .map((q) => ({
        question: q,
        categoryName: category.name[locale as "de" | "en"],
      }))
  ).sort((a, b) => {
    const severityOrder = { kritisch: 0, hoch: 1, mittel: 2 };
    return severityOrder[a.question.severity] - severityOrder[b.question.severity];
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t("title")}</h1>
          {auditData?.companyName && (
            <p className="text-slate-500 mt-1">{auditData.companyName}</p>
          )}
        </div>
        <div className="flex gap-3">
          <Link href={`/${locale}/audit/${auditId}/dashboard`}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="gap-2 bg-indigo-600 hover:bg-indigo-500"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? t("generating") : t("download")}
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("executiveSummary")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div
                className="text-5xl font-extrabold"
                style={{ color: getScoreColor(overallScore) }}
              >
                {overallScore}%
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {getScoreLabel(overallScore, locale)}
              </p>
            </div>
            <div className="flex-1 text-sm text-slate-600">
              <p>
                {locale === "de"
                  ? `Von ${NIS2_CATEGORIES.reduce((s, c) => s + c.questions.length, 0)} Fragen wurden ${answers.size} beantwortet. ${gapItems.length} kritische Lücken wurden identifiziert.`
                  : `Of ${NIS2_CATEGORIES.reduce((s, c) => s + c.questions.length, 0)} questions, ${answers.size} were answered. ${gapItems.length} critical gaps were identified.`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("categoryDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {NIS2_CATEGORIES.map((category) => {
            const cs = categoryScores.find(
              (s) => s.categoryId === category.id
            );
            return (
              <div key={category.id} className="flex items-center gap-4">
                <span className="w-48 text-sm font-medium truncate">
                  {tCategories(category.id)}
                </span>
                <Progress
                  value={cs?.score || 0}
                  className="h-3 flex-1"
                />
                <span
                  className="w-12 text-right text-sm font-bold"
                  style={{ color: getScoreColor(cs?.score || 0) }}
                >
                  {cs?.score || 0}%
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Gap Analysis */}
      {gapItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("gapAnalysis")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gapItems.map((item) => (
                <div
                  key={item.question.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <Badge
                    variant={
                      item.question.severity === "kritisch"
                        ? "destructive"
                        : "secondary"
                    }
                    className="shrink-0 mt-0.5"
                  >
                    {item.question.severity}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {item.question.text[locale as "de" | "en"]}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.categoryName} &middot;{" "}
                      {item.question.legalReference}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
