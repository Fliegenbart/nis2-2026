"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Plus,
  LogOut,
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  ClipboardCheck,
  RefreshCcw,
} from "lucide-react";

type UserRole = "admin" | "consultant" | "reviewer" | "client_readonly";

type FindingStatus = "draft" | "in_review" | "approved" | "closed";

type FindingSeverity = "critical" | "high" | "medium" | "low";

interface AuditSummary {
  id: string;
  clientName: string | null;
  companyName: string | null;
  industry: string | null;
  overallScore: number;
  answeredCount: number;
  totalQuestions: number;
  openActions: number;
  doneActions: number;
  openFindings: number;
  inReviewFindings: number;
  overdueFindings: number;
  criticalOpenFindings: number;
  programPhase:
    | "assessment"
    | "gap_review"
    | "roadmap"
    | "policies"
    | "controls"
    | "training"
    | "final_review"
    | "continuous_compliance";
  programStatus:
    | "setup_in_progress"
    | "blocked"
    | "final_review"
    | "continuous_compliance"
    | "completed";
  currentWeek: number;
  deliveryProgress: number;
  documentsApproved: number;
  totalDocuments: number;
  completedAssignments: number;
  totalAssignments: number;
  openReviewCases: number;
  updatedAt: string;
  createdAt: string;
}

interface ReviewItem {
  id: string;
  title: string;
  severity: FindingSeverity;
  status: FindingStatus;
  dueDate: string | null;
  updatedAt: string;
  reviewOwnerUserId: string | null;
  reviewOwner?: {
    id: string;
    name: string;
    role: UserRole;
  } | null;
  audit: {
    id: string;
    clientName: string | null;
    companyName: string | null;
  };
  _count: {
    comments: number;
    actionItems: number;
  };
}

interface ReviewSummary {
  total: number;
  inReview: number;
  overdue: number;
  criticalOpen: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName: string | null;
}

function ScoreDonut({ score }: { score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score <= 33 ? "#e11d48" : score <= 66 ? "#f59e0b" : "#10b981";

  return (
    <svg width="72" height="72" className="shrink-0">
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="#1e293b"
        strokeWidth="6"
      />
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 36 36)"
        className="transition-all duration-700"
      />
      <text
        x="36"
        y="40"
        textAnchor="middle"
        className="fill-slate-200 text-sm font-bold"
        fontSize="14"
      >
        {score}%
      </text>
    </svg>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return "Keine Frist";
  return formatDate(dateStr);
}

function isOverdue(item: ReviewItem): boolean {
  if (!item.dueDate || item.status === "closed") return false;
  return new Date(item.dueDate).getTime() < Date.now();
}

export default function ConsultantDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [audits, setAudits] = useState<AuditSummary[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [creating, setCreating] = useState(false);

  const [reviewScope, setReviewScope] = useState<"my" | "queue" | "all">("all");
  const [reviewStatus, setReviewStatus] = useState<"all" | FindingStatus>("all");
  const [reviewSeverity, setReviewSeverity] = useState<"all" | FindingSeverity>("all");
  const [reviewSort, setReviewSort] = useState<
    "due_asc" | "due_desc" | "updated_desc" | "severity_desc"
  >("due_asc");
  const [reviewOverdueOnly, setReviewOverdueOnly] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch("/api/consultant/auth/me");
        if (!meRes.ok) {
          router.push("/consultant/login");
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);
        setReviewScope(meData.user?.role === "reviewer" ? "my" : "all");

        const dashRes = await fetch("/api/consultant/dashboard");
        if (dashRes.ok) {
          const dashData = await dashRes.json();
          setAudits(dashData.audits);
        }
      } catch {
        router.push("/consultant/login");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [router]);

  async function loadReviews() {
    if (!user) return;

    const search = new URLSearchParams();
    search.set("scope", reviewScope);
    search.set("sort", reviewSort);
    if (reviewStatus !== "all") search.set("status", reviewStatus);
    if (reviewSeverity !== "all") search.set("severity", reviewSeverity);
    if (reviewOverdueOnly) search.set("overdue", "1");

    setIsReviewLoading(true);
    try {
      const res = await fetch(`/api/consultant/reviews?${search.toString()}`);
      if (!res.ok) return;

      const data = await res.json();
      setReviews(data.reviews || []);
      setReviewSummary(data.summary || null);
    } finally {
      setIsReviewLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user?.id,
    reviewScope,
    reviewStatus,
    reviewSeverity,
    reviewSort,
    reviewOverdueOnly,
  ]);

  async function handleClaimReview(item: ReviewItem) {
    if (!user) return;
    const res = await fetch(`/api/audit/${item.audit.id}/findings/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewOwnerUserId: user.id }),
    });

    if (res.ok) {
      await loadReviews();
    }
  }

  async function handleLogout() {
    await fetch("/api/consultant/auth/logout", { method: "POST" });
    router.push("/consultant/login");
  }

  async function handleCreateAudit(e: React.FormEvent) {
    e.preventDefault();
    if (!newClientName) return;
    setCreating(true);

    try {
      const res = await fetch("/api/consultant/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: newClientName,
          companyName: newCompanyName || undefined,
          industry: newIndustry || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/de/audit/${data.audit.id}/dashboard`);
      }
    } finally {
      setCreating(false);
    }
  }

  const reviewScopeLabel = useMemo(() => {
    if (reviewScope === "my") return "Meine Reviews";
    if (reviewScope === "queue") return "Review Queue";
    return "Alle Reviews";
  }, [reviewScope]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Shield className="h-12 w-12 animate-pulse text-indigo-600" />
      </div>
    );
  }

  const totalClients = audits.length;
  const avgScore =
    audits.length > 0
      ? Math.round(audits.reduce((s, a) => s + a.overallScore, 0) / audits.length)
      : 0;
  const totalOpenActions = audits.reduce((s, a) => s + a.openActions, 0);
  const totalOverdueFindings = audits.reduce((s, a) => s + a.overdueFindings, 0);
  const totalOpenReviewCases = audits.reduce((s, a) => s + a.openReviewCases, 0);

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">NIS2 Consultant</h1>
              {user?.companyName && (
                <p className="text-xs text-slate-400">{user.companyName}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-400 transition hover:border-slate-600 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Abmelden
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-indigo-400" />
              <span className="text-sm text-slate-400">Mandanten</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-white">{totalClients}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-slate-400">Ø Compliance-Score</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-white">{avgScore}%</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              <span className="text-sm text-slate-400">Offene Maßnahmen</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-white">{totalOpenActions}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-cyan-400" />
              <span className="text-sm text-slate-400">Review Cases / Overdue</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-white">
              {totalOpenReviewCases} / {totalOverdueFindings}
            </p>
          </div>
        </div>

        {(user?.role === "reviewer" || user?.role === "admin") && (
          <section className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">{reviewScopeLabel}</h2>
                <p className="text-xs text-slate-400">
                  {reviewSummary
                    ? `${reviewSummary.total} Findings, ${reviewSummary.inReview} in Review, ${reviewSummary.overdue} overdue`
                    : "Review-Daten werden geladen"}
                </p>
              </div>
              <button
                onClick={loadReviews}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-600"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Aktualisieren
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              <select
                value={reviewScope}
                onChange={(e) => setReviewScope(e.target.value as "my" | "queue" | "all")}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white"
              >
                <option value="my">Meine Reviews</option>
                <option value="queue">Queue (unassigned)</option>
                <option value="all">Alle</option>
              </select>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value as "all" | FindingStatus)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white"
              >
                <option value="all">Status: alle</option>
                <option value="draft">draft</option>
                <option value="in_review">in_review</option>
                <option value="approved">approved</option>
                <option value="closed">closed</option>
              </select>
              <select
                value={reviewSeverity}
                onChange={(e) => setReviewSeverity(e.target.value as "all" | FindingSeverity)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white"
              >
                <option value="all">Severity: alle</option>
                <option value="critical">critical</option>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
              <select
                value={reviewSort}
                onChange={(e) =>
                  setReviewSort(
                    e.target.value as "due_asc" | "due_desc" | "updated_desc" | "severity_desc"
                  )
                }
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white"
              >
                <option value="due_asc">Sort: due asc</option>
                <option value="due_desc">Sort: due desc</option>
                <option value="updated_desc">Sort: updated desc</option>
                <option value="severity_desc">Sort: severity</option>
              </select>
              <label className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={reviewOverdueOnly}
                  onChange={(e) => setReviewOverdueOnly(e.target.checked)}
                />
                Nur overdue
              </label>
            </div>

            {isReviewLoading ? (
              <p className="text-sm text-slate-400">Lade Reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-700 px-4 py-6 text-sm text-slate-500">
                Keine Findings für den aktuellen Filter.
              </p>
            ) : (
              <div className="space-y-2">
                {reviews.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-slate-400">
                        {(item.audit.clientName || item.audit.companyName || "Audit") +
                          ` | ${item.severity} | ${item.status} | ${formatDueDate(item.dueDate)}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        Reviewer: {item.reviewOwner?.name || "unassigned"} | Kommentare: {item._count.comments} | Maßnahmen: {item._count.actionItems}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {user?.role === "reviewer" && item.reviewOwnerUserId !== user.id && (
                        <button
                          onClick={() => handleClaimReview(item)}
                          className="rounded-md border border-violet-500/40 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-300"
                        >
                          Übernehmen
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/de/audit/${item.audit.id}/dashboard`)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-600 px-2.5 py-1 text-xs text-slate-200"
                      >
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        Öffnen
                      </button>
                      {isOverdue(item) && (
                        <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] text-rose-300">
                          overdue
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Mandanten-Übersicht</h2>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Neuer Mandant
          </button>
        </div>

        {showNewForm && (
          <form
            onSubmit={handleCreateAudit}
            className="mb-6 rounded-xl border border-indigo-500/30 bg-slate-900 p-6"
          >
            <h3 className="mb-4 text-sm font-medium text-indigo-400">Neuen Mandanten anlegen</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                type="text"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Mandantenname *"
                required
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="text"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Firmenname (optional)"
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <select
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Branche wählen...</option>
                <option value="saas">SaaS / Cloud</option>
                <option value="datacenter">Datacenter / Hosting</option>
                <option value="critical-infra">Kritische Infrastruktur</option>
                <option value="finance">Finanzdienstleistungen</option>
                <option value="healthcare">Gesundheitswesen</option>
                <option value="manufacturing">Fertigung / Industrie</option>
                <option value="general">Sonstige</option>
              </select>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                disabled={creating || !newClientName}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {creating ? "Erstelle..." : "Audit starten"}
              </button>
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="rounded-lg border border-slate-700 px-5 py-2 text-sm text-slate-400 transition hover:text-white"
              >
                Abbrechen
              </button>
            </div>
          </form>
        )}

        {audits.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-16">
            <Building2 className="mb-4 h-12 w-12 text-slate-600" />
            <p className="text-lg font-medium text-slate-400">Noch keine Mandanten</p>
            <p className="mt-1 text-sm text-slate-500">
              Legen Sie Ihren ersten Mandanten an, um ein Audit zu starten.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {audits.map((audit) => (
              <button
                key={audit.id}
                onClick={() => router.push(`/de/audit/${audit.id}/dashboard`)}
                className="group rounded-xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-slate-700 hover:bg-slate-800/80"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-white">
                      {audit.clientName || audit.companyName || "Unbenannt"}
                    </h3>
                    {audit.companyName && audit.clientName !== audit.companyName && (
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {audit.companyName}
                      </p>
                    )}
                    {audit.industry && (
                      <span className="mt-2 inline-block rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
                        {audit.industry}
                      </span>
                    )}
                  </div>
                  <ScoreDonut score={audit.overallScore} />
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    {audit.answeredCount}/{audit.totalQuestions}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                    {audit.deliveryProgress}% Delivery
                  </span>
                  {audit.openActions > 0 && (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      {audit.openActions} offen
                    </span>
                  )}
                  {audit.inReviewFindings > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-cyan-400" />
                      {audit.inReviewFindings} review
                    </span>
                  )}
                  {audit.overdueFindings > 0 && (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                      {audit.overdueFindings} overdue
                    </span>
                  )}
                </div>

                <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-500">
                    <span>{audit.programPhase.replaceAll("_", " ")}</span>
                    <span>{audit.programStatus.replaceAll("_", " ")}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-cyan-500 transition-all"
                      style={{ width: `${audit.deliveryProgress}%` }}
                    />
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                    <span>Week {audit.currentWeek}</span>
                    <span>
                      Docs {audit.documentsApproved}/{audit.totalDocuments}
                    </span>
                    <span>
                      Train {audit.completedAssignments}/{audit.totalAssignments}
                    </span>
                  </div>
                  {audit.openReviewCases > 0 && (
                    <p className="mt-2 text-[11px] text-amber-300">
                      {audit.openReviewCases} offene Human Reviews
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
                  <span className="text-xs text-slate-600">
                    <Clock className="mr-1 inline h-3 w-3" />
                    {formatDate(audit.updatedAt)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-600 transition group-hover:text-indigo-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
