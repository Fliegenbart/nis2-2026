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
  ownerName: string | null;
  ownerEmail: string | null;
  ownerUserId: string | null;
  findingId: string | null;
  questionId: string | null;
  categoryId: string | null;
  createdAt: string;
}

export interface FindingComment {
  id: string;
  body: string;
  authorRole: "consultant" | "reviewer" | "client";
  authorName: string | null;
  createdAt: string;
  authorUserId: string | null;
  authorUser?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

export interface Finding {
  id: string;
  title: string;
  description: string | null;
  severity: "critical" | "high" | "medium" | "low";
  status: "draft" | "in_review" | "approved" | "closed";
  dueDate: string | null;
  approvedAt: string | null;
  closedAt: string | null;
  questionId: string | null;
  categoryId: string | null;
  reviewOwnerUserId: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    role: string;
  } | null;
  reviewedBy?: {
    id: string;
    name: string;
    role: string;
  } | null;
  reviewOwner?: {
    id: string;
    name: string;
    role: string;
  } | null;
  comments: FindingComment[];
  _count?: {
    comments: number;
    actionItems: number;
  };
}

const DEBOUNCE_MS = 2000;

export function useAudit(auditId: string) {
  const [answers, setAnswers] = useState<Map<string, AnswerValue>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);

  const pendingChangesRef = useRef<Map<string, PendingChange>>(new Map());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load audit data, answers, evidences, and action items on mount
  useEffect(() => {
    let cancelled = false;

    async function loadAudit() {
      try {
        setIsLoading(true);

        const [auditRes, evidenceRes, actionsRes, findingsRes] = await Promise.all([
          fetch(`/api/audit/${auditId}`),
          fetch(`/api/audit/${auditId}/evidence`),
          fetch(`/api/audit/${auditId}/actions`),
          fetch(`/api/audit/${auditId}/findings`),
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

        if (findingsRes.ok) {
          const findingData = await findingsRes.json();
          if (!cancelled) setFindings(findingData.findings || []);
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
      status?: string;
      dueDate?: string | null;
      ownerName?: string;
      ownerEmail?: string;
      ownerUserId?: string;
      findingId?: string;
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
      updates: Partial<
        Pick<
          ActionItem,
          | "title"
          | "description"
          | "priority"
          | "status"
          | "dueDate"
          | "ownerName"
          | "ownerEmail"
          | "ownerUserId"
          | "findingId"
        >
      >
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

  // Finding workflow functions
  const addFinding = useCallback(
    async (finding: {
      title: string;
      description?: string;
      severity?: Finding["severity"];
      status?: Finding["status"];
      dueDate?: string | null;
      questionId?: string;
      categoryId?: string;
      reviewOwnerUserId?: string;
    }): Promise<Finding | null> => {
      try {
        const res = await fetch(`/api/audit/${auditId}/findings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finding),
        });
        if (!res.ok) return null;

        const data = await res.json();
        const created = data.finding as Finding;
        setFindings((prev) => [created, ...prev]);
        return created;
      } catch {
        return null;
      }
    },
    [auditId]
  );

  const updateFinding = useCallback(
    async (
      findingId: string,
      updates: Partial<
        Pick<
          Finding,
          | "title"
          | "description"
          | "severity"
          | "status"
          | "dueDate"
          | "questionId"
          | "categoryId"
          | "reviewOwnerUserId"
        >
      >
    ): Promise<boolean> => {
      try {
        const res = await fetch(`/api/audit/${auditId}/findings/${findingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) return false;

        const data = await res.json();
        const updated = data.finding as Finding;
        setFindings((prev) =>
          prev.map((item) => (item.id === findingId ? updated : item))
        );
        return true;
      } catch {
        return false;
      }
    },
    [auditId]
  );

  const deleteFinding = useCallback(
    async (findingId: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/audit/${auditId}/findings/${findingId}`, {
          method: "DELETE",
        });
        if (!res.ok) return false;

        setFindings((prev) => prev.filter((item) => item.id !== findingId));
        return true;
      } catch {
        return false;
      }
    },
    [auditId]
  );

  const addFindingComment = useCallback(
    async (findingId: string, message: string): Promise<FindingComment | null> => {
      try {
        const res = await fetch(
          `/api/audit/${auditId}/findings/${findingId}/comments`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
          }
        );
        if (!res.ok) return null;

        const data = await res.json();
        const comment = data.comment as FindingComment;
        setFindings((prev) =>
          prev.map((item) => {
            if (item.id !== findingId) return item;
            return {
              ...item,
              comments: [...item.comments, comment],
              _count: {
                comments: (item._count?.comments || 0) + 1,
                actionItems: item._count?.actionItems || 0,
              },
            };
          })
        );
        return comment;
      } catch {
        return null;
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
    findings,
    uploadEvidence,
    removeEvidence,
    addActionItem,
    updateActionItem,
    deleteActionItem,
    addFinding,
    updateFinding,
    deleteFinding,
    addFindingComment,
  };
}
