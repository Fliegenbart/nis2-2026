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

export interface ComplianceProgram {
  id: string;
  status:
    | "setup_in_progress"
    | "blocked"
    | "final_review"
    | "continuous_compliance"
    | "completed";
  currentPhase:
    | "assessment"
    | "gap_review"
    | "roadmap"
    | "policies"
    | "controls"
    | "training"
    | "final_review"
    | "continuous_compliance";
  currentWeek: number;
  startDate: string;
  targetDate: string;
  completedAt: string | null;
  ownerUserId: string | null;
}

export interface DocumentArtifact {
  id: string;
  type:
    | "information_security_policy"
    | "access_control_policy"
    | "incident_response_policy"
    | "backup_policy"
    | "vendor_security_policy"
    | "cyber_hygiene_handbook"
    | "incident_communication_plan";
  title: string;
  status:
    | "generated"
    | "customer_input_needed"
    | "expert_review_needed"
    | "legal_review_needed"
    | "approved"
    | "published";
  generatedContent: string;
  customContent: string | null;
  lastGeneratedAt: string;
  approvedAt: string | null;
  publishedAt: string | null;
  manualEditsCount: number;
}

export interface DocumentPackage {
  id: string;
  status: DocumentArtifact["status"];
  artifacts: DocumentArtifact[];
}

export interface TrainingCertificate {
  id: string;
  certificateNumber: string;
  issuedAt: string;
  url: string | null;
}

export interface TrainingAssignment {
  id: string;
  participantLabel: string;
  participantEmail: string | null;
  status: "pending" | "invited" | "in_progress" | "completed" | "overdue";
  completionPercent: number;
  quizScore: number | null;
  dueDate: string | null;
  completedAt: string | null;
  certificate?: TrainingCertificate | null;
}

export interface TrainingCampaign {
  id: string;
  type:
    | "security_basics"
    | "phishing_awareness"
    | "incident_reporting"
    | "password_security"
    | "sensitive_data_handling"
    | "management_cybersecurity_briefing";
  title: string;
  targetGroup: string;
  status: "planned" | "active" | "completed" | "overdue";
  isMandatory: boolean;
  dueDate: string | null;
  assignments: TrainingAssignment[];
}

export interface ReviewCase {
  id: string;
  type: "legal" | "security_expert" | "management_signoff";
  status: "open" | "in_progress" | "resolved" | "dismissed";
  decision:
    | "approved"
    | "changes_required"
    | "escalated"
    | "rejected"
    | "no_action"
    | null;
  title: string;
  triggerReason: string;
  details: string | null;
  source: string;
  affectedDocumentArtifactId: string | null;
  affectedTrainingCampaignId: string | null;
  assignedToUserId: string | null;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface DeliveryCompleteness {
  answeredCount: number;
  totalQuestions: number;
  documentsTotal: number;
  documentsApproved: number;
  assignmentsTotal: number;
  assignmentsCompleted: number;
  openReviewCases: number;
  assessmentCompleted: boolean;
  policiesApproved: boolean;
  trainingsComplete: boolean;
  readyForFinalReview: boolean;
  progress: number;
}

export interface ComplianceProgramSummary {
  phase: ComplianceProgram["currentPhase"];
  status: ComplianceProgram["status"];
  currentWeek: number;
  targetDate: string;
  openReviewCases: number;
  progress: number;
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
  const [complianceProgram, setComplianceProgram] = useState<ComplianceProgram | null>(null);
  const [programSummary, setProgramSummary] = useState<ComplianceProgramSummary | null>(null);
  const [documentPackage, setDocumentPackage] = useState<DocumentPackage | null>(null);
  const [trainingCampaigns, setTrainingCampaigns] = useState<TrainingCampaign[]>([]);
  const [reviewCases, setReviewCases] = useState<ReviewCase[]>([]);
  const [deliveryCompleteness, setDeliveryCompleteness] = useState<DeliveryCompleteness | null>(null);

  const pendingChangesRef = useRef<Map<string, PendingChange>>(new Map());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyAuditPayload = useCallback((data: any) => {
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
    setEvidences(data.evidences || []);
    setActionItems(data.actionItems || []);
    setFindings(data.findings || []);
    setComplianceProgram(data.complianceProgram || null);
    setProgramSummary(data.complianceProgramSummary || null);
    setDocumentPackage(data.documentPackage || null);
    setTrainingCampaigns(data.trainingCampaigns || []);
    setReviewCases(data.reviewCases || []);
    setDeliveryCompleteness(data.deliveryCompleteness || null);
  }, []);

  const refreshAudit = useCallback(async (): Promise<boolean> => {
    try {
      const auditRes = await fetch(`/api/audit/${auditId}`);
      if (!auditRes.ok) {
        return false;
      }

      const data = await auditRes.json();
      applyAuditPayload(data);
      return true;
    } catch (error) {
      console.error("Error refreshing audit:", error);
      return false;
    }
  }, [applyAuditPayload, auditId]);

  // Load audit data on mount
  useEffect(() => {
    let cancelled = false;

    async function loadAudit() {
      try {
        setIsLoading(true);
        const auditRes = await fetch(`/api/audit/${auditId}`);
        if (!auditRes.ok) throw new Error("Failed to load audit");
        const data = await auditRes.json();
        if (cancelled) return;
        applyAuditPayload(data);
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
  }, [applyAuditPayload, auditId]);

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
      } else {
        await refreshAudit();
      }
    } catch (error) {
      console.error("Error saving answers:", error);
    } finally {
      setIsSaving(false);
    }
  }, [auditId, refreshAudit]);

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
        await refreshAudit();
        return actionItem;
      } catch {
        return null;
      }
    },
    [auditId, refreshAudit]
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
        await refreshAudit();
        return true;
      } catch {
        return false;
      }
    },
    [auditId, refreshAudit]
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
        await refreshAudit();
        return true;
      } catch {
        return false;
      }
    },
    [auditId, refreshAudit]
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
        await refreshAudit();
        return created;
      } catch {
        return null;
      }
    },
    [auditId, refreshAudit]
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
        await refreshAudit();
        return true;
      } catch {
        return false;
      }
    },
    [auditId, refreshAudit]
  );

  const deleteFinding = useCallback(
    async (findingId: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/audit/${auditId}/findings/${findingId}`, {
          method: "DELETE",
        });
        if (!res.ok) return false;

        setFindings((prev) => prev.filter((item) => item.id !== findingId));
        await refreshAudit();
        return true;
      } catch {
        return false;
      }
    },
    [auditId, refreshAudit]
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
        await refreshAudit();
        return comment;
      } catch {
        return null;
      }
    },
    [auditId, refreshAudit]
  );

  const updateProgram = useCallback(
    async (
      updates: Partial<
        Pick<
          ComplianceProgram,
          "status" | "currentPhase" | "currentWeek" | "ownerUserId" | "targetDate"
        >
      >
    ): Promise<boolean> => {
      try {
        const res = await fetch(`/api/audit/${auditId}/program`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) return false;
        await refreshAudit();
        return true;
      } catch {
        return false;
      }
    },
    [auditId, refreshAudit]
  );

  const regenerateDocuments = useCallback(
    async (documentType?: DocumentArtifact["type"]): Promise<boolean> => {
      try {
        const res = await fetch(`/api/audit/${auditId}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ regenerate: true, documentType }),
        });
        if (!res.ok) return false;
        await refreshAudit();
        return true;
      } catch {
        return false;
      }
    },
    [auditId, refreshAudit]
  );

  const updateDocument = useCallback(
    async (
      documentId: string,
      updates: Partial<Pick<DocumentArtifact, "title" | "customContent" | "status">>
    ): Promise<boolean> => {
      try {
        const res = await fetch(`/api/audit/${auditId}/documents/${documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) return false;
        await refreshAudit();
        return true;
      } catch {
        return false;
      }
    },
    [auditId, refreshAudit]
  );

  const createTrainingCampaign = useCallback(
    async (campaign: {
      type: TrainingCampaign["type"];
      title: string;
      targetGroup: string;
      isMandatory?: boolean;
      dueDate?: string | null;
    }): Promise<boolean> => {
      try {
        const res = await fetch(`/api/audit/${auditId}/trainings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(campaign),
        });
        if (!res.ok) return false;
        await refreshAudit();
        return true;
      } catch {
        return false;
      }
    },
    [auditId, refreshAudit]
  );

  const updateTrainingCampaign = useCallback(
    async (
      campaignId: string,
      updates: Partial<
        Pick<TrainingCampaign, "title" | "targetGroup" | "isMandatory" | "dueDate" | "status">
      >
    ): Promise<boolean> => {
      try {
        const res = await fetch(`/api/audit/${auditId}/trainings/${campaignId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) return false;
        await refreshAudit();
        return true;
      } catch {
        return false;
      }
    },
    [auditId, refreshAudit]
  );

  const updateTrainingAssignment = useCallback(
    async (
      campaignId: string,
      assignmentId: string,
      updates: Partial<
        Pick<
          TrainingAssignment,
          "participantLabel" | "participantEmail" | "completionPercent" | "quizScore" | "status" | "dueDate"
        >
      >
    ): Promise<boolean> => {
      try {
        const res = await fetch(
          `/api/audit/${auditId}/trainings/${campaignId}/assignments/${assignmentId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          }
        );
        if (!res.ok) return false;
        await refreshAudit();
        return true;
      } catch {
        return false;
      }
    },
    [auditId, refreshAudit]
  );

  const updateReviewCase = useCallback(
    async (
      reviewCaseId: string,
      updates: Partial<Pick<ReviewCase, "status" | "decision" | "details" | "assignedToUserId">>
    ): Promise<boolean> => {
      try {
        const res = await fetch(`/api/audit/${auditId}/review-cases/${reviewCaseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) return false;
        await refreshAudit();
        return true;
      } catch {
        return false;
      }
    },
    [auditId, refreshAudit]
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
    complianceProgram,
    programSummary,
    documentPackage,
    trainingCampaigns,
    reviewCases,
    deliveryCompleteness,
    uploadEvidence,
    removeEvidence,
    addActionItem,
    updateActionItem,
    deleteActionItem,
    addFinding,
    updateFinding,
    deleteFinding,
    addFindingComment,
    refreshAudit,
    updateProgram,
    regenerateDocuments,
    updateDocument,
    createTrainingCampaign,
    updateTrainingCampaign,
    updateTrainingAssignment,
    updateReviewCase,
  };
}
