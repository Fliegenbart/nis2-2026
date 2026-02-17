"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

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
  updatedAt: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
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

export default function ConsultantDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [audits, setAudits] = useState<AuditSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [creating, setCreating] = useState(false);

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Shield className="h-12 w-12 text-indigo-600 animate-pulse" />
      </div>
    );
  }

  const totalClients = audits.length;
  const avgScore =
    audits.length > 0
      ? Math.round(audits.reduce((s, a) => s + a.overallScore, 0) / audits.length)
      : 0;
  const totalOpenActions = audits.reduce((s, a) => s + a.openActions, 0);
  const totalInReviewFindings = audits.reduce((s, a) => s + a.inReviewFindings, 0);
  const totalOverdueFindings = audits.reduce((s, a) => s + a.overdueFindings, 0);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
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
            <span className="text-sm text-slate-400">{user?.name}</span>
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
        {/* Stats Row */}
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
              <span className="text-sm text-slate-400">In Review / Overdue</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-white">
              {totalInReviewFindings} / {totalOverdueFindings}
            </p>
          </div>
        </div>

        {/* Header + Add Button */}
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

        {/* New Client Form */}
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

        {/* Audit Cards Grid */}
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
                  {audit.openActions > 0 && (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      {audit.openActions} offen
                    </span>
                  )}
                  {audit.doneActions > 0 && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />
                      {audit.doneActions} erledigt
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
