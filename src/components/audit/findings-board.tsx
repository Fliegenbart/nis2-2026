"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  MessageSquare,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import type { Finding } from "@/hooks/use-audit";

type SessionRole = "admin" | "consultant" | "reviewer" | "client_readonly" | null;

interface FindingsBoardProps {
  auditId: string;
  findings: Finding[];
  role: SessionRole;
  currentUserId: string | null;
  onCreate: (finding: {
    title: string;
    severity?: Finding["severity"];
    dueDate?: string | null;
    description?: string;
  }) => Promise<Finding | null>;
  onUpdate: (
    findingId: string,
    updates: Partial<
      Pick<
        Finding,
        "status" | "title" | "description" | "severity" | "dueDate" | "reviewOwnerUserId"
      >
    >
  ) => Promise<boolean>;
  onDelete: (findingId: string) => Promise<boolean>;
  onComment: (findingId: string, message: string) => Promise<unknown>;
}

const severityLabel: Record<Finding["severity"], string> = {
  critical: "Kritisch",
  high: "Hoch",
  medium: "Mittel",
  low: "Niedrig",
};

const severityStyle: Record<Finding["severity"], string> = {
  critical: "border-rose-200 bg-rose-50 text-rose-700",
  high: "border-amber-200 bg-amber-50 text-amber-700",
  medium: "border-sky-200 bg-sky-50 text-sky-700",
  low: "border-slate-200 bg-slate-50 text-slate-600",
};

const columns: Array<{ status: Finding["status"]; label: string }> = [
  { status: "draft", label: "Draft" },
  { status: "in_review", label: "In Review" },
  { status: "approved", label: "Approved" },
  { status: "closed", label: "Closed" },
];

function isOverdue(finding: Finding): boolean {
  if (!finding.dueDate || finding.status === "closed") return false;
  const due = new Date(finding.dueDate);
  const now = new Date();
  return due.getTime() < now.getTime();
}

function formatDueDate(value: string | null): string {
  if (!value) return "Keine Frist";
  return new Date(value).toLocaleDateString("de-DE");
}

export function FindingsBoard({
  auditId,
  findings,
  role,
  currentUserId,
  onCreate,
  onUpdate,
  onDelete,
  onComment,
}: FindingsBoardProps) {
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<Finding["severity"]>("medium");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const canCreate = role === "admin" || role === "consultant";
  const canReview = role === "admin" || role === "reviewer";
  const canEdit = role === "admin" || role === "consultant";
  const canComment = role === "admin" || role === "consultant" || role === "reviewer";

  const totals = useMemo(() => {
    const open = findings.filter((f) => f.status !== "closed").length;
    const inReview = findings.filter((f) => f.status === "in_review").length;
    const overdue = findings.filter(isOverdue).length;
    const critical = findings.filter(
      (f) => f.severity === "critical" && f.status !== "closed"
    ).length;
    return { open, inReview, overdue, critical };
  }, [findings]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !canCreate) return;
    setCreating(true);
    const created = await onCreate({
      title: title.trim(),
      severity,
      dueDate: dueDate || null,
      description: description.trim() || undefined,
    });
    if (created) {
      setTitle("");
      setSeverity("medium");
      setDueDate("");
      setDescription("");
    }
    setCreating(false);
  }

  async function handleStatusChange(finding: Finding, next: Finding["status"]) {
    await onUpdate(finding.id, { status: next });
  }

  async function handleComment(findingId: string) {
    if (!canComment) return;
    const message = (commentDrafts[findingId] || "").trim();
    if (!message) return;
    const created = await onComment(findingId, message);
    if (created) {
      setCommentDrafts((prev) => ({ ...prev, [findingId]: "" }));
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Findings Workflow</h2>
          <p className="text-sm text-slate-500">
            Reviewer-Modus: {canReview ? "aktiv" : "nicht aktiv"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
            Offen: <span className="font-semibold text-slate-900">{totals.open}</span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
            In Review: <span className="font-semibold text-slate-900">{totals.inReview}</span>
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
            Overdue: <span className="font-semibold">{totals.overdue}</span>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-700">
            Kritisch offen: <span className="font-semibold">{totals.critical}</span>
          </div>
        </div>
      </div>

      {canCreate && (
        <form
          onSubmit={handleCreate}
          className="mb-5 grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1.4fr_0.8fr_0.9fr_auto]"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Neues Finding..."
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Finding["severity"])}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="critical">Kritisch</option>
            <option value="high">Hoch</option>
            <option value="medium">Mittel</option>
            <option value="low">Niedrig</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Anlegen
          </button>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschreibung (optional)"
            className="sm:col-span-4 min-h-16 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </form>
      )}

      <div className="grid gap-4 lg:grid-cols-4">
        {columns.map((column) => {
          const items = findings.filter((f) => f.status === column.status);
          return (
            <div key={column.status} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">{column.label}</h3>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
                  {items.length}
                </span>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${severityStyle[item.severity]}`}
                      >
                        {severityLabel[item.severity]}
                      </span>
                    </div>

                    {item.description && (
                      <p className="mb-2 text-xs text-slate-600">{item.description}</p>
                    )}

                    <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        {item._count?.actionItems || 0} Maßnahmen
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {item._count?.comments || item.comments.length} Kommentare
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                        Reviewer: {item.reviewOwner?.name || "unassigned"}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 ${
                          isOverdue(item)
                            ? "bg-rose-100 text-rose-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        Fällig: {formatDueDate(item.dueDate)}
                      </span>
                    </div>

                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {canEdit && item.status === "draft" && (
                        <button
                          onClick={() => handleStatusChange(item, "in_review")}
                          className="rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700"
                        >
                          In Review
                        </button>
                      )}
                      {canEdit && item.status === "in_review" && (
                        <button
                          onClick={() => handleStatusChange(item, "draft")}
                          className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                        >
                          Zurück auf Draft
                        </button>
                      )}
                      {canReview && item.status === "in_review" && (
                        <button
                          onClick={() => handleStatusChange(item, "approved")}
                          className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                        >
                          Freigeben
                        </button>
                      )}
                      {canReview &&
                        item.status === "in_review" &&
                        currentUserId &&
                        item.reviewOwnerUserId !== currentUserId && (
                          <button
                            onClick={() =>
                              onUpdate(item.id, { reviewOwnerUserId: currentUserId })
                            }
                            className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700"
                          >
                            Übernehmen
                          </button>
                        )}
                      {canReview && item.status === "approved" && (
                        <button
                          onClick={() => handleStatusChange(item, "closed")}
                          className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                        >
                          Schließen
                        </button>
                      )}
                      {canCreate && (
                        <button
                          onClick={() => onDelete(item.id)}
                          className="ml-auto inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Löschen
                        </button>
                      )}
                    </div>

                    {canComment && (
                      <div className="mt-2 flex gap-1">
                        <input
                          value={commentDrafts[item.id] || ""}
                          onChange={(e) =>
                            setCommentDrafts((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          placeholder="Kommentar hinzufügen..."
                          className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-900"
                        />
                        <button
                          onClick={() => handleComment(item.id)}
                          className="rounded-md border border-slate-300 px-2 py-1.5 text-slate-600"
                          title="Kommentar senden"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {item.comments.length > 0 && (
                      <div className="mt-2 space-y-1 rounded-md bg-slate-50 p-2">
                        {item.comments.slice(-2).map((comment) => (
                          <p key={comment.id} className="text-[11px] text-slate-600">
                            <span className="font-semibold text-slate-700">
                              {comment.authorName || comment.authorRole}
                            </span>
                            : {comment.body}
                          </p>
                        ))}
                      </div>
                    )}
                  </article>
                ))}

                {items.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-4 text-center text-xs text-slate-400">
                    <AlertCircle className="mx-auto mb-1 h-4 w-4" />
                    Keine Findings
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!canCreate && !canReview && (
        <p className="mt-3 inline-flex items-center gap-1 text-xs text-slate-500">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Read-only Modus
        </p>
      )}
      <p className="mt-2 text-xs text-slate-400">
        Audit-Trail Export:{" "}
        <a
          className="underline"
          href={`/api/audit/${auditId}/findings/history?format=csv`}
          target="_blank"
          rel="noreferrer"
        >
          CSV herunterladen
        </a>
      </p>
    </section>
  );
}
