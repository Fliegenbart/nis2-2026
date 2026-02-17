import { prisma } from "@/lib/prisma";
import { generateAuditPDF } from "@/lib/pdf-generator";
import { getOrCreateAuditSnapshot } from "@/lib/audit-snapshot";

export interface GeneratedAuditReport {
  snapshotId: string;
  fileName: string;
  pdfBytes: Uint8Array;
}

export async function generateAuditReport(
  auditId: string
): Promise<GeneratedAuditReport | null> {
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

  const pdfBytes = await generateAuditPDF(
    {
      companyName: audit.companyName,
      revenue: audit.revenue,
      locale: audit.locale,
    },
    audit.answers.map((answer) => ({
      questionId: answer.questionId,
      categoryId: answer.categoryId,
      value: answer.value,
      notes: answer.notes,
    }))
  );

  return {
    snapshotId: snapshot.id,
    fileName: `nis2-audit-report-${auditId.slice(0, 8)}.pdf`,
    pdfBytes,
  };
}
