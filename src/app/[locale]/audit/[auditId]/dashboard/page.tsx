"use client";

import { useEffect, useState } from "react";
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
import { FindingsBoard } from "@/components/audit/findings-board";

type SessionRole = "admin" | "consultant" | "reviewer" | "client_readonly" | null;

export default function DashboardPage() {
  const params = useParams();
  const auditId = params.auditId as string;
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const {
    answers,
    isLoading,
    auditData,
    findings,
    addFinding,
    updateFinding,
    deleteFinding,
    addFindingComment,
  } = useAudit(auditId);
  const { overallScore, categoryScores } = useScoring(answers);
  const [sessionRole, setSessionRole] = useState<SessionRole>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRole() {
      try {
        const res = await fetch("/api/consultant/auth/me");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setSessionRole((data.user?.role as SessionRole) || null);
        }
      } catch {
        // fallback to null role
      }
    }

    loadRole();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Shield className="h-12 w-12 text-cyan-400 animate-pulse" />
            <p className="text-slate-400">{t("title")}...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="scan-lines" />
      <div className="dot-grid" />
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-3xl font-bold">{t("title")}</h1>
            {auditData?.companyName && (
              <p className="text-slate-400 mt-1">{auditData.companyName}</p>
            )}
          </div>
          <Link href={`/${locale}/audit/${auditId}/report`}>
            <Button variant="outline" className="gap-2 border-slate-700 text-slate-400 hover:text-white hover:border-cyan-500/40">
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

        <FindingsBoard
          findings={findings}
          role={sessionRole}
          onCreate={addFinding}
          onUpdate={updateFinding}
          onDelete={deleteFinding}
          onComment={addFindingComment}
        />
      </div>
    </div>
  );
}
