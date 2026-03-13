import { DocumentStatus, ReviewCaseStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ensureAuditAccess } from "@/lib/audit-access";
import { ensureComplianceArtifactsForAudit } from "@/lib/compliance-program";
import { updateDocumentArtifactSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string; documentId: string }> }
) {
  try {
    const { auditId, documentId } = await params;
    const access = await ensureAuditAccess(request, auditId, "write");
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const session = await getSession(request);
    const body = updateDocumentArtifactSchema.parse(await request.json());

    const artifact = await prisma.documentArtifact.findFirst({
      where: { id: documentId, auditId },
      include: {
        reviewCases: true,
      },
    });

    if (!artifact) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const hasOpenLegalReview = artifact.reviewCases.some(
      (reviewCase) =>
        reviewCase.status !== ReviewCaseStatus.resolved &&
        reviewCase.status !== ReviewCaseStatus.dismissed
    );

    if (
      hasOpenLegalReview &&
      (body.status === DocumentStatus.approved || body.status === DocumentStatus.published)
    ) {
      return NextResponse.json(
        { error: "Resolve open review cases before approving or publishing this document" },
        { status: 409 }
      );
    }

    const customContentChanged =
      body.customContent !== undefined && body.customContent !== artifact.customContent;

    const updated = await prisma.documentArtifact.update({
      where: { id: artifact.id },
      data: {
        ...(body.title ? { title: body.title } : {}),
        ...(body.status ? { status: body.status } : {}),
        ...(body.customContent !== undefined ? { customContent: body.customContent } : {}),
        ...(customContentChanged
          ? {
              manualEditsCount: artifact.manualEditsCount + 1,
              lastEditedByUserId: session?.id ?? null,
            }
          : {}),
        ...(body.status === DocumentStatus.approved ? { approvedAt: new Date() } : {}),
        ...(body.status === DocumentStatus.published ? { publishedAt: new Date() } : {}),
      },
    });

    await ensureComplianceArtifactsForAudit(auditId);

    return NextResponse.json({ document: updated });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
