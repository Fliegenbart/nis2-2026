import { NextRequest, NextResponse } from "next/server";
import { ensureAuditAccess } from "@/lib/audit-access";
import {
  ensureComplianceArtifactsForAudit,
  getAuditComplianceOverview,
  regenerateDocumentArtifacts,
} from "@/lib/compliance-program";
import { getSession } from "@/lib/auth";
import { createOrRefreshDocumentsSchema } from "@/lib/validators";

async function parseBody(request: NextRequest) {
  const raw = await request.text();
  if (!raw) {
    return createOrRefreshDocumentsSchema.parse({});
  }
  return createOrRefreshDocumentsSchema.parse(JSON.parse(raw));
}

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
      documentPackage: overview.documentPackage,
      deliveryCompleteness: overview.deliveryCompleteness,
      reviewCases: overview.reviewCases,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string }> }
) {
  try {
    const { auditId } = await params;
    const access = await ensureAuditAccess(request, auditId, "write");
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const session = await getSession(request);
    const body = await parseBody(request);

    await ensureComplianceArtifactsForAudit(auditId);
    if (body.regenerate) {
      await regenerateDocumentArtifacts(auditId, {
        documentType: body.documentType,
        lastEditedByUserId: session?.id ?? null,
      });
    }

    const overview = await getAuditComplianceOverview(auditId);
    return NextResponse.json({
      documentPackage: overview?.documentPackage ?? null,
      deliveryCompleteness: overview?.deliveryCompleteness ?? null,
      refreshed: body.regenerate,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
