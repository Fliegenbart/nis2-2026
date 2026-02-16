"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { AnswerValue } from "@/data/nis2-framework";

interface AuditData {
  id: string;
  companyName: string | null;
  revenue: number | null;
  employeeCount: number | null;
  industry: string | null;
  locale: string;
  isPremium: boolean;
  clientName?: string | null;
}

interface ApiAnswer {
  questionId: string;
  categoryId: string;
  value: string;
}

interface PendingChange {
  questionId: string;
  categoryId: string;
  value: AnswerValue;
}

export interface Evidence {
  id: string;
  filename: string;
  url: string;
  mimeType: string | null;
  uploadedAt: string;
  questionId: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  questionId: string | null;
  categoryId: string | null;
  createdAt: string;
}

const DEBOUNCE_MS = 2000;

export function useAudit(auditId: string) {
  const [answers, setAnswers] = useState<Map<string, AnswerValue>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  const pendingChangesRef = useRef<Map<string, PendingChange>>(new Map());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load audit data, answers, evidences, and action items on mount
  useEffect(() => {
    let cancelled = false;

    async function loadAudit() {
      try {
        setIsLoading(true);

        const [auditRes, evidenceRes, actionsRes] = await Promise.all([
          fetch(`/api/audit/${auditId}`),
          fetch(`/api/audit/${auditId}/evidence`),
          fetch(`/api/audit/${auditId}/actions`),
        ]);

        if (!auditRes.ok) throw new Error("Failed to load audit");
        const data = await auditRes.json();
        if (cancelled) return;

        setAuditData({
          id: data.id,
          companyName: data.companyName,
          revenue: data.revenue,
          employeeCount: data.employeeCount,
          industry: data.industry,
          locale: data.locale,
          isPremium: data.isPremium,
          clientName: data.clientName,
        });

        const answersMap = new Map<string, AnswerValue>();
        if (data.answers) {
          data.answers.forEach((a: ApiAnswer) => {
            answersMap.set(a.questionId, a.value as AnswerValue);
          });
        }
        setAnswers(answersMap);

        if (evidenceRes.ok) {
          const evData = await evidenceRes.json();
          if (!cancelled) setEvidences(evData.evidences || []);
        }

        if (actionsRes.ok) {
          const actData = await actionsRes.json();
          if (!cancelled) setActionItems(actData.actionItems || []);
        }
      } catch (error) {
        console.error("Error loading audit:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadAudit();

    return () => {
      cancelled = true;
    };
  }, [auditId]);

  // Flush pending changes on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (pendingChangesRef.current.size > 0) {
        flushChanges();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flushChanges = useCallback(async () => {
    const pending = pendingChangesRef.current;
    if (pending.size === 0) return;

    const batch = Array.from(pending.values());
    pendingChangesRef.current = new Map();

    setIsSaving(true);
    try {
      const res = await fetch(`/api/audit/${auditId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: batch }),
      });

      if (!res.ok) {
        console.error("Failed to save answers:", await res.text());
      }
    } catch (error) {
      console.error("Error saving answers:", error);
    } finally {
      setIsSaving(false);
    }
  }, [auditId]);

  const setAnswer = useCallback(
    (questionId: string, categoryId: string, value: AnswerValue) => {
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(questionId, value);
        return next;
      });

      pendingChangesRef.current.set(questionId, {
        questionId,
        categoryId,
        value,
      });

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        flushChanges();
      }, DEBOUNCE_MS);
    },
    [flushChanges]
  );

  // Evidence functions
  const uploadEvidence = useCallback(
    async (questionId: string, file: File): Promise<Evidence | null> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("questionId", questionId);

      try {
        const res = await fetch(`/api/audit/${auditId}/evidence`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) return null;

        const data = await res.json();
        const evidence = data.evidence as Evidence;
        setEvidences((prev) => [evidence, ...prev]);
        return evidence;
      } catch {
        return null;
      }
    },
    [auditId]
  );

  const removeEvidence = useCallback(
    async (evidenceId: string): Promise<boolean> => {
      try {
        const res = await fetch(
          `/api/audit/${auditId}/evidence/${evidenceId}`,
          { method: "DELETE" }
        );

        if (!res.ok) return false;

        setEvidences((prev) => prev.filter((e) => e.id !== evidenceId));
        return true;
      } catch {
        return false;
      }
    },
    [auditId]
  );

  // ActionItem functions
  const addActionItem = useCallback(
    async (item: {
      title: string;
      description?: string;
      priority?: string;
      questionId?: string;
      categoryId?: string;
    }): Promise<ActionItem | null> => {
      try {
        const res = await fetch(`/api/audit/${auditId}/actions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });

        if (!res.ok) return null;

        const data = await res.json();
        const actionItem = data.actionItem as ActionItem;
        setActionItems((prev) => [actionItem, ...prev]);
        return actionItem;
      } catch {
        return null;
      }
    },
    [auditId]
  );

  const updateActionItem = useCallback(
    async (
      actionId: string,
      updates: Partial<Pick<ActionItem, "title" | "description" | "priority" | "status" | "dueDate">>
    ): Promise<boolean> => {
      try {
        const res = await fetch(
          `/api/audit/${auditId}/actions/${actionId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          }
        );

        if (!res.ok) return false;

        const data = await res.json();
        setActionItems((prev) =>
          prev.map((a) => (a.id === actionId ? data.actionItem : a))
        );
        return true;
      } catch {
        return false;
      }
    },
    [auditId]
  );

  const deleteActionItem = useCallback(
    async (actionId: string): Promise<boolean> => {
      try {
        const res = await fetch(
          `/api/audit/${auditId}/actions/${actionId}`,
          { method: "DELETE" }
        );

        if (!res.ok) return false;

        setActionItems((prev) => prev.filter((a) => a.id !== actionId));
        return true;
      } catch {
        return false;
      }
    },
    [auditId]
  );

  return {
    answers,
    setAnswer,
    isLoading,
    isSaving,
    auditData,
    evidences,
    actionItems,
    uploadEvidence,
    removeEvidence,
    addActionItem,
    updateActionItem,
    deleteActionItem,
  };
}
