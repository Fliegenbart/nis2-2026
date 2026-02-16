"use client";

import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Download, FileText, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="flex items-center justify-center min-h-[60vh] bg-slate-950">
        <Shield className="h-12 w-12 text-cyan-400 animate-pulse" />
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
    <div className="min-h-screen bg-slate-950 scan-lines relative">
      {/* Background texture layer */}
      <div className="dot-grid opacity-30 absolute inset-0 pointer-events-none" />

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
            {auditData?.companyName && (
              <p className="text-slate-400 mt-1">{auditData.companyName}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Link href={`/${locale}/audit/${auditId}/dashboard`}>
              <Button variant="outline" className="gap-2 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              className="gap-2 bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? t("generating") : t("download")}
            </Button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5" />
            {t("executiveSummary")}
          </h2>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div
                className="font-mono text-5xl font-extrabold"
                style={{ color: getScoreColor(overallScore) }}
              >
                {overallScore}%
              </div>
              <p
                className="text-sm mt-1"
                style={{ color: getScoreColor(overallScore) }}
              >
                {getScoreLabel(overallScore, locale)}
              </p>
            </div>
            <div className="flex-1 text-slate-400 text-sm">
              <p>
                {locale === "de"
                  ? `Von ${NIS2_CATEGORIES.reduce((s, c) => s + c.questions.length, 0)} Fragen wurden ${answers.size} beantwortet. ${gapItems.length} kritische Lücken wurden identifiziert.`
                  : `Of ${NIS2_CATEGORIES.reduce((s, c) => s + c.questions.length, 0)} questions, ${answers.size} were answered. ${gapItems.length} critical gaps were identified.`}
              </p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">{t("categoryDetails")}</h2>
          <div className="space-y-4">
            {NIS2_CATEGORIES.map((category) => {
              const cs = categoryScores.find(
                (s) => s.categoryId === category.id
              );
              return (
                <div key={category.id} className="flex items-center gap-4">
                  <span className="w-48 text-slate-300 text-sm font-medium truncate">
                    {tCategories(category.id)}
                  </span>
                  <div className="h-3 rounded-full bg-slate-800 flex-1">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${cs?.score || 0}%`,
                        backgroundColor: getScoreColor(cs?.score || 0),
                      }}
                    />
                  </div>
                  <span
                    className="w-12 text-right text-sm font-bold font-mono"
                    style={{ color: getScoreColor(cs?.score || 0) }}
                  >
                    {cs?.score || 0}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gap Analysis */}
        {gapItems.length > 0 && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-4">{t("gapAnalysis")}</h2>
            <div className="space-y-3">
              {gapItems.map((item) => (
                <div
                  key={item.question.id}
                  className="flex items-start gap-3 border border-slate-700/30 bg-slate-800/30 rounded-xl p-4"
                >
                  <span
                    className={`shrink-0 mt-0.5 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      item.question.severity === "kritisch"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                    }`}
                  >
                    {item.question.severity}
                  </span>
                  <div className="min-w-0">
                    <p className="text-slate-200 text-sm font-medium">
                      {item.question.text[locale as "de" | "en"]}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      {item.categoryName} &middot;{" "}
                      {item.question.legalReference}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
