import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateAuditSchema } from "@/lib/validators";
import { ensureAuditAccess } from "@/lib/audit-access";
import { ensureComplianceArtifactsForAudit, getAuditComplianceOverview } from "@/lib/compliance-program";

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

    await ensureComplianceArtifactsForAudit(auditId);
    const audit = await getAuditComplianceOverview(auditId);

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    return NextResponse.json(audit);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string }> }
) {
  try {
    const { auditId } = await params;
    const access = await ensureAuditAccess(request, auditId, "write");
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const body = await request.json();
    const data = updateAuditSchema.parse(body);

    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      select: { id: true, isLocked: true },
    });
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }
    if (audit.isLocked) {
      return NextResponse.json(
        { error: "Audit is locked" },
        { status: 409 }
      );
    }

    const updatedAudit = await prisma.audit.update({
      where: { id: auditId },
      data,
    });

    await ensureComplianceArtifactsForAudit(auditId);

    return NextResponse.json(updatedAudit);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
