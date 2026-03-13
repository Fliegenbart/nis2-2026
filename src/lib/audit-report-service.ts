import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateAuditPDF } from "@/lib/pdf-generator";
import { getOrCreateAuditSnapshot } from "@/lib/audit-snapshot";
import { ensureComplianceArtifactsForAudit } from "@/lib/compliance-program";

export interface GeneratedAuditReport {
  snapshotId: string;
  fileName: string;
  pdfBytes: Uint8Array;
}

interface SnapshotAnswer {
  questionId: string;
  categoryId: string;
  value: string;
  notes?: string | null;
}

function getSnapshotAnswers(payload: Prisma.JsonValue): SnapshotAnswer[] | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const answers = (payload as { answers?: unknown }).answers;
  if (!Array.isArray(answers)) {
    return null;
  }

  const snapshotAnswers = answers.filter((answer): answer is SnapshotAnswer => {
    if (!answer || typeof answer !== "object" || Array.isArray(answer)) {
      return false;
    }

    const candidate = answer as Record<string, unknown>;
    return (
      typeof candidate.questionId === "string" &&
      typeof candidate.categoryId === "string" &&
      typeof candidate.value === "string" &&
      (candidate.notes === undefined ||
        candidate.notes === null ||
        typeof candidate.notes === "string")
    );
  });

  return snapshotAnswers.length === answers.length ? snapshotAnswers : null;
}

export async function generateAuditReport(
  auditId: string
): Promise<GeneratedAuditReport | null> {
  const complianceOverview = await ensureComplianceArtifactsForAudit(auditId);
  const snapshot = await getOrCreateAuditSnapshot(auditId);
  if (!snapshot) {
    return null;
  }

  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    include: { answers: true },
  });
  if (!audit) {
    return null;
  }

  const reportAnswers =
    getSnapshotAnswers(snapshot.payload) ??
    audit.answers.map((answer) => ({
      questionId: answer.questionId,
      categoryId: answer.categoryId,
      value: answer.value,
      notes: answer.notes,
    }));

  const pdfBytes = await generateAuditPDF(
    {
      companyName: audit.companyName,
      revenue: audit.revenue,
      locale: audit.locale,
      deliveryCompleteness: complianceOverview?.deliveryCompleteness,
    },
    reportAnswers
  );

  return {
    snapshotId: snapshot.id,
    fileName: `nis2-audit-report-${auditId.slice(0, 8)}.pdf`,
    pdfBytes,
  };
}
