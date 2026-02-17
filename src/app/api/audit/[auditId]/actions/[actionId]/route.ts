import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureAuditAccess } from "@/lib/audit-access";
import {
  isActionPriority,
  isActionStatus,
  parseOptionalDate,
} from "@/lib/workflow";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string; actionId: string }> }
) {
  try {
    const { auditId, actionId } = await params;
    const access = await ensureAuditAccess(request, auditId, "write");
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const existing = await prisma.actionItem.findFirst({
      where: { id: actionId, auditId },
      select: {
        id: true,
        audit: {
          select: { organizationId: true },
        },
      },
    });
    if (!existing) {
      return NextResponse.json({ error: "Action item not found" }, { status: 404 });
    }

    const body = await request.json();
    const updates: Prisma.ActionItemUncheckedUpdateInput = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json({ error: "Invalid title" }, { status: 400 });
      }
      updates.title = body.title.trim();
    }

    if (body.description !== undefined) {
      updates.description = body.description || null;
    }

    if (body.priority !== undefined) {
      if (!isActionPriority(body.priority)) {
        return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
      }
      updates.priority = body.priority;
    }

    if (body.status !== undefined) {
      if (!isActionStatus(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updates.status = body.status;
    }

    if (body.dueDate !== undefined) {
      const dueDate = parseOptionalDate(body.dueDate);
      if (dueDate === undefined) {
        return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 });
      }
      updates.dueDate = dueDate;
    }

    if (body.ownerName !== undefined) {
      updates.ownerName = body.ownerName || null;
    }

    if (body.ownerEmail !== undefined) {
      updates.ownerEmail = body.ownerEmail || null;
    }

    if (body.findingId !== undefined) {
      if (body.findingId) {
        const finding = await prisma.finding.findFirst({
          where: { id: body.findingId, auditId },
          select: { id: true },
        });
        if (!finding) {
          return NextResponse.json({ error: "Finding not found" }, { status: 404 });
        }
      }
      updates.findingId = body.findingId || null;
    }

    if (body.ownerUserId !== undefined) {
      if (body.ownerUserId) {
        const owner = await prisma.user.findFirst({
          where: {
            id: body.ownerUserId,
            ...(existing.audit.organizationId
              ? { organizationId: existing.audit.organizationId }
              : {}),
          },
          select: { id: true },
        });
        if (!owner) {
          return NextResponse.json({ error: "Owner user not found" }, { status: 404 });
        }
      }
      updates.ownerUserId = body.ownerUserId || null;
    }

    const actionItem = await prisma.actionItem.update({
      where: { id: actionId },
      data: updates,
    });

    return NextResponse.json({ actionItem });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string; actionId: string }> }
) {
  try {
    const { auditId, actionId } = await params;
    const access = await ensureAuditAccess(request, auditId, "write");
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const deleted = await prisma.actionItem.deleteMany({
      where: { id: actionId, auditId },
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Action item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
