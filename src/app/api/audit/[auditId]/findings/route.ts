import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuditAccess } from "@/lib/audit-access";
import { getSession } from "@/lib/auth";
import {
  canTransitionFindingStatus,
  isFindingSeverity,
  isFindingStatus,
  parseOptionalDate,
} from "@/lib/workflow";

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

    const findings = await prisma.finding.findMany({
      where: { auditId },
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
      orderBy: [{ status: "asc" }, { severity: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ findings });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const severity =
      body.severity === undefined
        ? "medium"
        : isFindingSeverity(body.severity)
          ? body.severity
          : null;
    if (!severity) {
      return NextResponse.json({ error: "Invalid severity" }, { status: 400 });
    }

    const status =
      body.status === undefined
        ? "draft"
        : isFindingStatus(body.status)
          ? body.status
          : null;
    if (!status) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (!canTransitionFindingStatus("draft", status)) {
      return NextResponse.json(
        { error: "Invalid status transition from draft" },
        { status: 400 }
      );
    }

    const dueDate = parseOptionalDate(body.dueDate);
    if (body.dueDate !== undefined && dueDate === undefined) {
      return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 });
    }

    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      select: { id: true },
    });
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    const user = await getSession(request);

    const finding = await prisma.finding.create({
      data: {
        auditId,
        title,
        description: body.description || null,
        severity,
        status,
        dueDate: dueDate ?? null,
        questionId: body.questionId || null,
        categoryId: body.categoryId || null,
        createdByUserId: user?.id || null,
      },
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

    return NextResponse.json({ finding }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
