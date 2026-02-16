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

const DEBOUNCE_MS = 2000;

export function useAudit(auditId: string) {
  const [answers, setAnswers] = useState<Map<string, AnswerValue>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [auditData, setAuditData] = useState<AuditData | null>(null);

  const pendingChangesRef = useRef<Map<string, PendingChange>>(new Map());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load audit data and answers on mount
  useEffect(() => {
    let cancelled = false;

    async function loadAudit() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/audit/${auditId}`);
        if (!res.ok) throw new Error("Failed to load audit");

        const data = await res.json();
        if (cancelled) return;

        setAuditData({
          id: data.id,
          companyName: data.companyName,
          revenue: data.revenue,
          employeeCount: data.employeeCount,
          industry: data.industry,
          locale: data.locale,
          isPremium: data.isPremium,
        });

        const answersMap = new Map<string, AnswerValue>();
        if (data.answers) {
          data.answers.forEach((a: ApiAnswer) => {
            answersMap.set(a.questionId, a.value as AnswerValue);
          });
        }
        setAnswers(answersMap);
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
      // Flush remaining changes
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
      // Update local state immediately
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(questionId, value);
        return next;
      });

      // Add to pending changes
      pendingChangesRef.current.set(questionId, {
        questionId,
        categoryId,
        value,
      });

      // Debounce the API call
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        flushChanges();
      }, DEBOUNCE_MS);
    },
    [flushChanges]
  );

  return {
    answers,
    setAnswer,
    isLoading,
    isSaving,
    auditData,
  };
}
