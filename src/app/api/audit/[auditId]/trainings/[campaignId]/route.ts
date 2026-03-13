import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuditAccess } from "@/lib/audit-access";
import { ensureComplianceArtifactsForAudit } from "@/lib/compliance-program";
import { updateTrainingCampaignSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string; campaignId: string }> }
) {
  try {
    const { auditId, campaignId } = await params;
    const access = await ensureAuditAccess(request, auditId, "write");
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const body = updateTrainingCampaignSchema.parse(await request.json());
    const campaign = await prisma.trainingCampaign.findFirst({
      where: { id: campaignId, auditId },
      select: { id: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const updated = await prisma.trainingCampaign.update({
      where: { id: campaign.id },
      data: {
        ...(body.title ? { title: body.title } : {}),
        ...(body.targetGroup ? { targetGroup: body.targetGroup } : {}),
        ...(body.isMandatory !== undefined ? { isMandatory: body.isMandatory } : {}),
        ...(body.dueDate !== undefined
          ? { dueDate: body.dueDate ? new Date(body.dueDate) : null }
          : {}),
        ...(body.status ? { status: body.status } : {}),
      },
      include: {
        assignments: {
          include: { certificate: true },
        },
      },
    });

    await ensureComplianceArtifactsForAudit(auditId);
    return NextResponse.json({ campaign: updated });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
