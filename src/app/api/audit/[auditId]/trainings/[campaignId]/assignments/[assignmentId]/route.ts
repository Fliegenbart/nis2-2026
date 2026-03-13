import { TrainingAssignmentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ensureComplianceArtifactsForAudit,
  getInitialTrainingAssignmentStatus,
} from "@/lib/compliance-program";
import { ensureAuditAccess } from "@/lib/audit-access";
import { updateTrainingAssignmentSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ auditId: string; campaignId: string; assignmentId: string }>;
  }
) {
  try {
    const { auditId, campaignId, assignmentId } = await params;
    const access = await ensureAuditAccess(request, auditId, "write");
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const body = updateTrainingAssignmentSchema.parse(await request.json());
    const assignment = await prisma.trainingAssignment.findFirst({
      where: {
        id: assignmentId,
        campaignId,
        campaign: {
          auditId,
        },
      },
      include: {
        certificate: true,
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const nextDueDate =
      body.dueDate !== undefined
        ? body.dueDate
          ? new Date(body.dueDate)
          : null
        : assignment.dueDate;
    const nextCompletion =
      body.completionPercent !== undefined
        ? body.completionPercent
        : assignment.completionPercent;
    const nextStatus =
      body.status ??
      getInitialTrainingAssignmentStatus(nextCompletion, nextDueDate);

    const updated = await prisma.trainingAssignment.update({
      where: { id: assignment.id },
      data: {
        ...(body.participantLabel ? { participantLabel: body.participantLabel } : {}),
        ...(body.participantEmail !== undefined ? { participantEmail: body.participantEmail } : {}),
        ...(body.completionPercent !== undefined
          ? { completionPercent: body.completionPercent }
          : {}),
        ...(body.quizScore !== undefined ? { quizScore: body.quizScore } : {}),
        ...(body.dueDate !== undefined ? { dueDate: nextDueDate } : {}),
        status: nextStatus,
        ...(nextStatus === TrainingAssignmentStatus.completed
          ? { completedAt: assignment.completedAt ?? new Date() }
          : {}),
      },
      include: {
        certificate: true,
      },
    });

    if (nextStatus === TrainingAssignmentStatus.completed && !updated.certificate) {
      await prisma.trainingCertificate.create({
        data: {
          assignmentId: updated.id,
          certificateNumber: `NIS2-${updated.id.slice(0, 8)}-${Date.now()}`,
          payload: {
            participantLabel: updated.participantLabel,
            completedAt: updated.completedAt,
            quizScore: updated.quizScore,
          },
        },
      });
    }

    await ensureComplianceArtifactsForAudit(auditId);

    const refreshed = await prisma.trainingAssignment.findUnique({
      where: { id: updated.id },
      include: { certificate: true },
    });

    return NextResponse.json({ assignment: refreshed });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
