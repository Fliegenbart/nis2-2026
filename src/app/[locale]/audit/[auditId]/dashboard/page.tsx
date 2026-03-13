"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Shield, Download, History, FileText, GraduationCap, Scale, RefreshCcw } from "lucide-react";
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
interface SessionUserLite {
  id: string;
  role: SessionRole;
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

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
    programSummary,
    documentPackage,
    trainingCampaigns,
    reviewCases,
    deliveryCompleteness,
    regenerateDocuments,
    updateProgram,
    addFinding,
    updateFinding,
    deleteFinding,
    addFindingComment,
  } = useAudit(auditId);
  const { overallScore, categoryScores } = useScoring(answers);
  const [sessionUser, setSessionUser] = useState<SessionUserLite | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRole() {
      try {
        const res = await fetch("/api/consultant/auth/me");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setSessionUser({
            id: data.user?.id || "",
            role: (data.user?.role as SessionRole) || null,
          });
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
          <div className="flex items-center gap-2">
            <a href={`/api/audit/${auditId}/findings/history?format=csv`} target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2 border-slate-700 text-slate-400 hover:text-white hover:border-cyan-500/40">
                <History className="h-4 w-4" />
                History CSV
              </Button>
            </a>
            <Link href={`/${locale}/audit/${auditId}/report`}>
              <Button variant="outline" className="gap-2 border-slate-700 text-slate-400 hover:text-white hover:border-cyan-500/40">
                <Download className="h-4 w-4" />
                {t("downloadReport")}
              </Button>
            </Link>
          </div>
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

        <div className="mb-8 grid gap-6 xl:grid-cols-3">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 xl:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-400">
                  NIS2 in 30 Tagen
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">Program Status</h2>
              </div>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                Week {programSummary?.currentWeek ?? 1}
              </span>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>Phase</span>
                <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs">
                  {formatLabel(programSummary?.phase || "assessment")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs">
                  {formatLabel(programSummary?.status || "setup_in_progress")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Target</span>
                <span>
                  {programSummary?.targetDate
                    ? new Date(programSummary.targetDate).toLocaleDateString("de-DE")
                    : "--"}
                </span>
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>Delivery completeness</span>
                <span>{deliveryCompleteness?.progress ?? 0}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-500 transition-all"
                  style={{ width: `${deliveryCompleteness?.progress ?? 0}%` }}
                />
              </div>
            </div>
            <div className="mt-5 space-y-2 text-xs text-slate-400">
              <p>
                Assessment: {deliveryCompleteness?.answeredCount ?? 0}/
                {deliveryCompleteness?.totalQuestions ?? 0}
              </p>
              <p>
                Policies: {deliveryCompleteness?.documentsApproved ?? 0}/
                {deliveryCompleteness?.documentsTotal ?? 0}
              </p>
              <p>
                Trainings: {deliveryCompleteness?.assignmentsCompleted ?? 0}/
                {deliveryCompleteness?.assignmentsTotal ?? 0}
              </p>
              <p>Open red flags: {deliveryCompleteness?.openReviewCases ?? 0}</p>
            </div>
            {sessionUser && deliveryCompleteness?.readyForFinalReview && (
              <button
                type="button"
                onClick={() =>
                  updateProgram({
                    currentPhase: "final_review",
                    status: "final_review",
                  })
                }
                className="mt-5 w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Final Review starten
              </button>
            )}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 xl:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Policies & Dokumente</h2>
              </div>
              <button
                type="button"
                onClick={() => regenerateDocuments()}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-600"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Drafts refreshen
              </button>
            </div>
            <div className="space-y-3">
              {(documentPackage?.artifacts || []).map((artifact) => (
                <div
                  key={artifact.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{artifact.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {artifact.manualEditsCount > 0
                          ? `${artifact.manualEditsCount} manuelle Anpassungen`
                          : "Standardentwurf"}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300">
                      {formatLabel(artifact.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 xl:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">Trainings & Nachweise</h2>
            </div>
            <div className="space-y-3">
              {trainingCampaigns.map((campaign) => {
                const completedAssignments = campaign.assignments.filter(
                  (assignment) => assignment.status === "completed"
                ).length;
                return (
                  <div
                    key={campaign.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">{campaign.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {campaign.targetGroup} · {completedAssignments}/{campaign.assignments.length} erledigt
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300">
                        {formatLabel(campaign.status)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Scale className="h-4 w-4 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Human Review Layer</h2>
          </div>
          {reviewCases.length === 0 ? (
            <p className="text-sm text-slate-400">
              Aktuell keine offenen juristischen oder fachlichen Eskalationen.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {reviewCases.map((reviewCase) => (
                <div
                  key={reviewCase.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-white">{reviewCase.title}</span>
                    <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300">
                      {formatLabel(reviewCase.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {reviewCase.type.replaceAll("_", " ")} · {reviewCase.triggerReason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <CategoryProgressGrid
          categories={NIS2_CATEGORIES}
          categoryScores={categoryScores}
          auditId={auditId}
        />

        <FindingsBoard
          auditId={auditId}
          findings={findings}
          role={sessionUser?.role || null}
          currentUserId={sessionUser?.id || null}
          onCreate={addFinding}
          onUpdate={updateFinding}
          onDelete={deleteFinding}
          onComment={addFindingComment}
        />
      </div>
    </div>
  );
}
