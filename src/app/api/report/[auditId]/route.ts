import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAuditPDF } from "@/lib/pdf-generator";
import { ensureAuditAccess } from "@/lib/audit-access";
import { getOrCreateAuditSnapshot } from "@/lib/audit-snapshot";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string }> }
) {
  try {
    const { auditId } = await params;
    const access = await ensureAuditAccess(request, auditId, "read");
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const snapshot = await getOrCreateAuditSnapshot(auditId);
    if (!snapshot) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      include: { answers: true },
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    const pdfBytes = await generateAuditPDF(
      {
        companyName: audit.companyName,
        revenue: audit.revenue,
        locale: audit.locale,
      },
      audit.answers.map((a) => ({
        questionId: a.questionId,
        categoryId: a.categoryId,
        value: a.value,
      }))
    );

    return new NextResponse(pdfBytes.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="nis2-audit-report-${auditId.slice(0, 8)}.pdf"`,
        "X-Audit-Snapshot-Id": snapshot.id,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
