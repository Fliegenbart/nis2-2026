import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuditAccess } from "@/lib/audit-access";
import {
  CONSULTANT_READ_ROLES,
  getSession,
  hasRole,
} from "@/lib/auth";
import { getCommentRoleForUserRole } from "@/lib/workflow";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string; findingId: string }> }
) {
  try {
    const { auditId, findingId } = await params;
    const access = await ensureAuditAccess(request, auditId, "read");
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const finding = await prisma.finding.findFirst({
      where: { id: findingId, auditId },
      select: { id: true },
    });
    if (!finding) {
      return NextResponse.json({ error: "Finding not found" }, { status: 404 });
    }

    const comments = await prisma.findingComment.findMany({
      where: { findingId },
      include: {
        authorUser: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    if (!user || !hasRole(user, CONSULTANT_READ_ROLES)) {
      return NextResponse.json(
        { error: "Only consultant users can create comments" },
        { status: 403 }
      );
    }

    const finding = await prisma.finding.findFirst({
      where: { id: findingId, auditId },
      select: { id: true },
    });
    if (!finding) {
      return NextResponse.json({ error: "Finding not found" }, { status: 404 });
    }

    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const comment = await prisma.findingComment.create({
      data: {
        findingId,
        body: message,
        authorRole: getCommentRoleForUserRole(user.role),
        authorName: user.name,
        authorUserId: user.id,
      },
      include: {
        authorUser: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
