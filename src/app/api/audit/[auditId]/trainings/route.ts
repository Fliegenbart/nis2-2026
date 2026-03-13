import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuditAccess } from "@/lib/audit-access";
import { ensureComplianceArtifactsForAudit, getAuditComplianceOverview } from "@/lib/compliance-program";
import { createTrainingCampaignSchema } from "@/lib/validators";

function buildTrainingSummary(
  campaigns: NonNullable<Awaited<ReturnType<typeof getAuditComplianceOverview>>>["trainingCampaigns"]
) {
  const assignments = campaigns.flatMap((campaign) => campaign.assignments);
  return {
    totalCampaigns: campaigns.length,
    completedCampaigns: campaigns.filter((campaign) => campaign.status === "completed").length,
    overdueCampaigns: campaigns.filter((campaign) => campaign.status === "overdue").length,
    totalAssignments: assignments.length,
    completedAssignments: assignments.filter((assignment) => assignment.status === "completed").length,
    certificatesIssued: assignments.filter((assignment) => assignment.certificate).length,
  };
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
      campaigns: overview.trainingCampaigns,
      summary: buildTrainingSummary(overview.trainingCampaigns),
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

    const body = createTrainingCampaignSchema.parse(await request.json());
    const overview = await ensureComplianceArtifactsForAudit(auditId);
    if (!overview?.complianceProgram) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const campaign = await prisma.trainingCampaign.create({
      data: {
        auditId,
        programId: overview.complianceProgram.id,
        type: body.type,
        title: body.title,
        targetGroup: body.targetGroup,
        isMandatory: body.isMandatory,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
    });

    await prisma.trainingAssignment.create({
      data: {
        campaignId: campaign.id,
        participantLabel: body.targetGroup,
        dueDate: campaign.dueDate,
      },
    });

    const refreshed = await ensureComplianceArtifactsForAudit(auditId);

    return NextResponse.json({
      campaign,
      summary: refreshed ? buildTrainingSummary(refreshed.trainingCampaigns) : null,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
