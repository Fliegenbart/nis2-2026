"use client";

import { useState } from "react";
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import type { ActionItem } from "@/hooks/use-audit";

interface ActionItemsProps {
  actionItems: ActionItem[];
  auditId: string;
  onAdd: (item: {
    title: string;
    description?: string;
    priority?: string;
    categoryId?: string;
  }) => Promise<ActionItem | null>;
  onUpdate: (
    actionId: string,
    updates: Partial<Pick<ActionItem, "title" | "description" | "priority" | "status">>
  ) => Promise<boolean>;
  onDelete: (actionId: string) => Promise<boolean>;
}

const priorityConfig = {
  critical: { label: "Kritisch", color: "text-rose-600 bg-rose-50 border-rose-200" },
  high: { label: "Hoch", color: "text-amber-600 bg-amber-50 border-amber-200" },
  medium: { label: "Mittel", color: "text-blue-600 bg-blue-50 border-blue-200" },
  low: { label: "Niedrig", color: "text-slate-500 bg-slate-50 border-slate-200" },
};

const statusIcons = {
  open: Circle,
  in_progress: Clock,
  done: CheckCircle2,
};

export function ActionItemsList({
  actionItems,
  onAdd,
  onUpdate,
  onDelete,
}: ActionItemsProps) {
  const [expanded, setExpanded] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [creating, setCreating] = useState(false);

  const openItems = actionItems.filter((a) => a.status !== "done");
  const doneItems = actionItems.filter((a) => a.status === "done");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    await onAdd({ title: newTitle.trim(), priority: newPriority });
    setNewTitle("");
    setNewPriority("medium");
    setShowForm(false);
    setCreating(false);
  }

  async function cycleStatus(item: ActionItem) {
    const nextStatus =
      item.status === "open"
        ? "in_progress"
        : item.status === "in_progress"
          ? "done"
          : "open";
    await onUpdate(item.id, { status: nextStatus });
  }

  function renderItem(item: ActionItem) {
    const StatusIcon = statusIcons[item.status as keyof typeof statusIcons] || Circle;
    const pConfig = priorityConfig[item.priority as keyof typeof priorityConfig] || priorityConfig.medium;

    return (
      <div
        key={item.id}
        className={`flex items-start gap-3 rounded-lg border px-4 py-3 transition ${
          item.status === "done"
            ? "border-slate-100 bg-slate-50/50 opacity-60"
            : "border-slate-200 bg-white"
        }`}
      >
        <button
          onClick={() => cycleStatus(item)}
          className={`mt-0.5 shrink-0 transition ${
            item.status === "done"
              ? "text-emerald-500"
              : item.status === "in_progress"
                ? "text-amber-500"
                : "text-slate-300 hover:text-slate-500"
          }`}
          title="Status wechseln"
        >
          <StatusIcon className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium ${
              item.status === "done" ? "text-slate-400 line-through" : "text-slate-900"
            }`}
          >
            {item.title}
          </p>
          {item.description && (
            <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
          )}
        </div>

        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${pConfig.color}`}
        >
          {pConfig.label}
        </span>

        <button
          onClick={() => onDelete(item.id)}
          className="shrink-0 text-slate-300 transition hover:text-rose-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-semibold text-slate-900">
            Maßnahmen
          </h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {openItems.length} offen
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4">
          <div className="space-y-2">
            {openItems.map(renderItem)}
            {doneItems.length > 0 && (
              <>
                <p className="mt-4 text-xs font-medium text-slate-400">
                  Erledigt ({doneItems.length})
                </p>
                {doneItems.map(renderItem)}
              </>
            )}
          </div>

          {/* Add form */}
          {showForm ? (
            <form onSubmit={handleAdd} className="mt-4 flex gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Neue Maßnahme..."
                autoFocus
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="critical">Kritisch</option>
                <option value="high">Hoch</option>
                <option value="medium">Mittel</option>
                <option value="low">Niedrig</option>
              </select>
              <button
                type="submit"
                disabled={creating || !newTitle.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {creating ? "..." : "Hinzufügen"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 transition hover:text-slate-700"
              >
                ×
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 flex items-center gap-1.5 text-sm text-indigo-600 transition hover:text-indigo-500"
            >
              <Plus className="h-4 w-4" />
              Maßnahme hinzufügen
            </button>
          )}
        </div>
      )}
    </div>
  );
}
