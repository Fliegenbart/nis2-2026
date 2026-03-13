import { ReviewCaseStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuditAccess } from "@/lib/audit-access";
import { ensureComplianceArtifactsForAudit } from "@/lib/compliance-program";
import { CONSULTANT_READ_ROLES, requireAuthWithRoles } from "@/lib/auth";
import { updateReviewCaseSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string; reviewCaseId: string }> }
) {
  try {
    const { auditId, reviewCaseId } = await params;
    const user = await requireAuthWithRoles(request, CONSULTANT_READ_ROLES);
    const access = await ensureAuditAccess(request, auditId, "read");
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const body = updateReviewCaseSchema.parse(await request.json());
    const reviewCase = await prisma.reviewCase.findFirst({
      where: { id: reviewCaseId, auditId },
      select: { id: true },
    });

    if (!reviewCase) {
      return NextResponse.json({ error: "Review case not found" }, { status: 404 });
    }

    const nextStatus = body.status;
    const updated = await prisma.reviewCase.update({
      where: { id: reviewCase.id },
      data: {
        ...(body.details ? { details: body.details } : {}),
        ...(body.decision !== undefined ? { decision: body.decision } : {}),
        ...(body.assignedToUserId !== undefined
          ? { assignedToUserId: body.assignedToUserId }
          : nextStatus === ReviewCaseStatus.in_progress
            ? { assignedToUserId: user.id }
            : {}),
        ...(nextStatus ? { status: nextStatus } : {}),
        ...(nextStatus === ReviewCaseStatus.resolved || nextStatus === ReviewCaseStatus.dismissed
          ? {
              reviewedByUserId: user.id,
              reviewedAt: new Date(),
            }
          : {}),
      },
    });

    await ensureComplianceArtifactsForAudit(auditId);
    return NextResponse.json({ reviewCase: updated });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
