import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureAuditAccess } from "@/lib/audit-access";
import { getSession } from "@/lib/auth";
import {
  canTransitionFindingStatus,
  isFindingSeverity,
  isFindingStatus,
  parseOptionalDate,
} from "@/lib/workflow";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string; findingId: string }> }
) {
  try {
    const { auditId, findingId } = await params;
    const access = await ensureAuditAccess(request, auditId, "write");
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const existing = await prisma.finding.findFirst({
      where: { id: findingId, auditId },
      select: { id: true, status: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Finding not found" }, { status: 404 });
    }

    const body = await request.json();
    const updates: Prisma.FindingUncheckedUpdateInput = {};

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

    if (body.status !== undefined) {
      if (!isFindingStatus(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      if (!canTransitionFindingStatus(existing.status, body.status)) {
        return NextResponse.json(
          {
            error: `Invalid status transition from ${existing.status} to ${body.status}`,
          },
          { status: 400 }
        );
      }

      const user = await getSession(request);
      const now = new Date();
      updates.status = body.status;

      if (body.status === "approved") {
        updates.approvedAt = now;
        updates.closedAt = null;
        updates.reviewedByUserId = user?.id || null;
      } else if (body.status === "closed") {
        updates.closedAt = now;
        if (!existing.status || existing.status !== "approved") {
          updates.approvedAt = now;
        }
        updates.reviewedByUserId = user?.id || null;
      } else {
        updates.approvedAt = null;
        updates.closedAt = null;
        updates.reviewedByUserId = null;
      }
    }

    const finding = await prisma.finding.update({
      where: { id: findingId },
      data: updates,
      include: {
        createdBy: {
          select: { id: true, name: true, role: true },
        },
        reviewedBy: {
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
      },
    });

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

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
