import { NextRequest, NextResponse } from "next/server";
import { ensureAuditAccess } from "@/lib/audit-access";
import { requireAuthWithRoles, CONSULTANT_READ_ROLES } from "@/lib/auth";
import { ensureComplianceArtifactsForAudit } from "@/lib/compliance-program";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string }> }
) {
  try {
    const { auditId } = await params;
    await requireAuthWithRoles(request, CONSULTANT_READ_ROLES);
    const access = await ensureAuditAccess(request, auditId, "read");
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const overview = await ensureComplianceArtifactsForAudit(auditId);
    if (!overview) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    return NextResponse.json({
      reviewCases: overview.reviewCases,
      summary: {
        total: overview.reviewCases.length,
        open: overview.reviewCases.filter((item) => item.status === "open").length,
        inProgress: overview.reviewCases.filter((item) => item.status === "in_progress").length,
        resolved: overview.reviewCases.filter((item) => item.status === "resolved").length,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
