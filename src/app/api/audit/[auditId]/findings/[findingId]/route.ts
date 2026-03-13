import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureAuditAccess } from "@/lib/audit-access";
import {
  CONSULTANT_WRITE_ROLES,
  getSession,
  hasRole,
} from "@/lib/auth";
import {
  canTransitionFindingStatus,
  isFindingSeverity,
  isFindingStatus,
  parseOptionalDate,
} from "@/lib/workflow";
import { ensureComplianceArtifactsForAudit } from "@/lib/compliance-program";

const FINDING_INCLUDE = {
  createdBy: {
    select: { id: true, name: true, role: true },
  },
  reviewedBy: {
    select: { id: true, name: true, role: true },
  },
  reviewOwner: {
    select: { id: true, name: true, role: true },
  },
  comments: {
    include: {
      authorUser: {
        select: { id: true, name: true, role: true },
      },
    },
    orderBy: { createdAt: "asc" },
  },
  _count: {
    select: {
      comments: true,
      actionItems: true,
    },
  },
} satisfies Prisma.FindingInclude;

type MetadataDiffValue = string | number | boolean | null;
type FindingFieldDiff = {
  from: MetadataDiffValue;
  to: MetadataDiffValue;
};

function toMetadataDate(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string; findingId: string }> }
) {
  try {
    const { auditId, findingId } = await params;
    const access = await ensureAuditAccess(request, auditId, "read");
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const user = await getSession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canWriteFinding = hasRole(user, CONSULTANT_WRITE_ROLES);
    const canReviewFinding = user.role === "reviewer" || user.role === "admin";
    if (!canWriteFinding && !canReviewFinding) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.finding.findFirst({
      where: { id: findingId, auditId },
      select: {
        id: true,
        title: true,
        description: true,
        severity: true,
        status: true,
        dueDate: true,
        questionId: true,
        categoryId: true,
        reviewOwnerUserId: true,
        audit: {
          select: { organizationId: true },
        },
      },
    });
    if (!existing) {
      return NextResponse.json({ error: "Finding not found" }, { status: 404 });
    }

    const body = await request.json();
    const updates: Prisma.FindingUncheckedUpdateInput = {};

    const hasReviewerRestrictedField =
      body.title !== undefined ||
      body.description !== undefined ||
      body.severity !== undefined ||
      body.questionId !== undefined ||
      body.categoryId !== undefined ||
      body.dueDate !== undefined;

    if (!canWriteFinding && hasReviewerRestrictedField) {
      return NextResponse.json(
        { error: "Reviewer may only update finding status or claim ownership" },
        { status: 403 }
      );
    }

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json({ error: "Invalid title" }, { status: 400 });
      }
      updates.title = body.title.trim();
    }

    if (body.description !== undefined) {
      updates.description = body.description || null;
    }

    if (body.severity !== undefined) {
      if (!isFindingSeverity(body.severity)) {
        return NextResponse.json({ error: "Invalid severity" }, { status: 400 });
      }
      updates.severity = body.severity;
    }

    if (body.dueDate !== undefined) {
      const dueDate = parseOptionalDate(body.dueDate);
      if (dueDate === undefined) {
        return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 });
      }
      updates.dueDate = dueDate;
    }

    if (body.questionId !== undefined) {
      updates.questionId = body.questionId || null;
    }

    if (body.categoryId !== undefined) {
      updates.categoryId = body.categoryId || null;
    }

    if (body.reviewOwnerUserId !== undefined) {
      if (!body.reviewOwnerUserId) {
        if (!canWriteFinding) {
          return NextResponse.json(
            { error: "Reviewer cannot clear review owner" },
            { status: 403 }
          );
        }
        updates.reviewOwnerUserId = null;
      } else if (!canWriteFinding) {
        if (body.reviewOwnerUserId !== user.id) {
          return NextResponse.json(
            { error: "Reviewer can only claim own assignments" },
            { status: 403 }
          );
        }
        updates.reviewOwnerUserId = user.id;
      } else {
        const owner = await prisma.user.findFirst({
          where: {
            id: body.reviewOwnerUserId,
            ...(existing.audit.organizationId
              ? { organizationId: existing.audit.organizationId }
              : {}),
            role: { in: ["reviewer", "admin"] },
          },
          select: { id: true },
        });
        if (!owner) {
          return NextResponse.json(
            { error: "Review owner not found" },
            { status: 404 }
          );
        }
        updates.reviewOwnerUserId = owner.id;
      }
    }

    const statusChangeRequested =
      body.status !== undefined && body.status !== existing.status;

    if (body.status !== undefined) {
      if (!isFindingStatus(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      if (
        (body.status === "approved" || body.status === "closed") &&
        !canReviewFinding
      ) {
        return NextResponse.json(
          { error: "Only reviewers can approve or close findings" },
          { status: 403 }
        );
      }
      if (!canWriteFinding && body.status === "draft") {
        return NextResponse.json(
          { error: "Reviewer cannot move findings to draft" },
          { status: 403 }
        );
      }

      if (!canTransitionFindingStatus(existing.status, body.status)) {
        return NextResponse.json(
          {
            error: `Invalid status transition from ${existing.status} to ${body.status}`,
          },
          { status: 400 }
        );
      }

      const now = new Date();
      updates.status = body.status;

      if (body.status === "approved") {
        updates.approvedAt = now;
        updates.closedAt = null;
        updates.reviewedByUserId = user.id;
      } else if (body.status === "closed") {
        updates.closedAt = now;
        if (existing.status !== "approved") {
          updates.approvedAt = now;
        }
        updates.reviewedByUserId = user.id;
      } else {
        updates.approvedAt = null;
        updates.closedAt = null;
        if (canReviewFinding) {
          updates.reviewedByUserId = null;
        }
      }
    }

    if (!canWriteFinding && body.status === undefined && body.reviewOwnerUserId === undefined) {
      return NextResponse.json(
        { error: "status or reviewOwnerUserId is required for reviewer updates" },
        { status: 400 }
      );
    }

    const note = typeof body.note === "string" ? body.note.trim() : null;
    const changedFields: Record<string, FindingFieldDiff> = {};

    if (updates.title !== undefined && typeof updates.title === "string") {
      if (existing.title !== updates.title) {
        changedFields.title = { from: existing.title, to: updates.title };
      }
    }
    if (updates.description !== undefined) {
      const nextValue = (updates.description ?? null) as string | null;
      if ((existing.description ?? null) !== nextValue) {
        changedFields.description = {
          from: existing.description ?? null,
          to: nextValue,
        };
      }
    }
    if (updates.severity !== undefined && typeof updates.severity === "string") {
      if (existing.severity !== updates.severity) {
        changedFields.severity = { from: existing.severity, to: updates.severity };
      }
    }
    if (updates.dueDate !== undefined) {
      const nextDueDate =
        updates.dueDate instanceof Date ? updates.dueDate : null;
      const fromDueDate = toMetadataDate(existing.dueDate);
      const toDueDate = toMetadataDate(nextDueDate);
      if (fromDueDate !== toDueDate) {
        changedFields.dueDate = {
          from: fromDueDate,
          to: toDueDate,
        };
      }
    }
    if (updates.questionId !== undefined) {
      const nextValue = (updates.questionId ?? null) as string | null;
      if ((existing.questionId ?? null) !== nextValue) {
        changedFields.questionId = {
          from: existing.questionId ?? null,
          to: nextValue,
        };
      }
    }
    if (updates.categoryId !== undefined) {
      const nextValue = (updates.categoryId ?? null) as string | null;
      if ((existing.categoryId ?? null) !== nextValue) {
        changedFields.categoryId = {
          from: existing.categoryId ?? null,
          to: nextValue,
        };
      }
    }
    if (updates.reviewOwnerUserId !== undefined) {
      const nextValue = (updates.reviewOwnerUserId ?? null) as string | null;
      if ((existing.reviewOwnerUserId ?? null) !== nextValue) {
        changedFields.reviewOwnerUserId = {
          from: existing.reviewOwnerUserId ?? null,
          to: nextValue,
        };
      }
    }
    if (statusChangeRequested && isFindingStatus(body.status)) {
      changedFields.status = {
        from: existing.status,
        to: body.status,
      };
    }

    const finding = await prisma.$transaction(async (tx) => {
      const updated = await tx.finding.update({
        where: { id: findingId },
        data: updates,
        include: FINDING_INCLUDE,
      });

      if (statusChangeRequested && isFindingStatus(body.status)) {
        await tx.findingStatusHistory.create({
          data: {
            findingId,
            fromStatus: existing.status,
            toStatus: body.status,
            changedByUserId: user.id,
            note: note || null,
            metadata: {
              event: "status_change",
              changedFields,
            },
          },
        });
      }

      return updated;
    });

    await ensureComplianceArtifactsForAudit(auditId);

    return NextResponse.json({ finding });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string; findingId: string }> }
) {
  try {
    const { auditId, findingId } = await params;
    const access = await ensureAuditAccess(request, auditId, "write");
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const deleted = await prisma.finding.deleteMany({
      where: { id: findingId, auditId },
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Finding not found" }, { status: 404 });
    }

    await ensureComplianceArtifactsForAudit(auditId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
