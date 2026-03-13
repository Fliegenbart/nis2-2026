import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuditAccess } from "@/lib/audit-access";
import { ensureComplianceArtifactsForAudit, getAuditComplianceOverview } from "@/lib/compliance-program";
import { updateProgramSchema } from "@/lib/validators";

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

    const overview = await ensureComplianceArtifactsForAudit(auditId);
    if (!overview) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    return NextResponse.json({
      program: overview.complianceProgram,
      summary: overview.complianceProgramSummary,
      deliveryCompleteness: overview.deliveryCompleteness,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

    await ensureComplianceArtifactsForAudit(auditId);
    const body = updateProgramSchema.parse(await request.json());

    const program = await prisma.complianceProgram.findUnique({
      where: { auditId },
      select: { id: true },
    });
    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const updated = await prisma.complianceProgram.update({
      where: { id: program.id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.currentPhase ? { currentPhase: body.currentPhase } : {}),
        ...(body.currentWeek ? { currentWeek: body.currentWeek } : {}),
        ...(body.ownerUserId !== undefined ? { ownerUserId: body.ownerUserId } : {}),
        ...(body.targetDate ? { targetDate: new Date(body.targetDate) } : {}),
      },
    });

    const overview = await ensureComplianceArtifactsForAudit(auditId);

    return NextResponse.json({
      program: updated,
      summary: overview?.complianceProgramSummary ?? null,
      deliveryCompleteness: overview?.deliveryCompleteness ?? null,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
