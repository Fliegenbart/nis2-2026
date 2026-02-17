import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuditAccess } from "@/lib/audit-access";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string; actionId: string }> }
) {
  try {
    const { auditId, actionId } = await params;
    const access = await ensureAuditAccess(request, auditId);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const existing = await prisma.actionItem.findFirst({
      where: { id: actionId, auditId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Action item not found" }, { status: 404 });
    }

    const body = await request.json();

    const actionItem = await prisma.actionItem.update({
      where: { id: actionId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.dueDate !== undefined && {
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
        }),
      },
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
    const access = await ensureAuditAccess(request, auditId);
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
