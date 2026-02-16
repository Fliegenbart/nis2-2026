import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ auditId: string }> }
) {
  try {
    const { auditId } = await params;

    const actionItems = await prisma.actionItem.findMany({
      where: { auditId },
      orderBy: [
        { priority: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ actionItems });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ auditId: string }> }
) {
  try {
    const { auditId } = await params;
    const body = await request.json();

    const audit = await prisma.audit.findUnique({ where: { id: auditId } });
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    const actionItem = await prisma.actionItem.create({
      data: {
        title: body.title,
        description: body.description || null,
        priority: body.priority || "medium",
        status: body.status || "open",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        auditId,
        questionId: body.questionId || null,
        categoryId: body.categoryId || null,
      },
    });

    return NextResponse.json({ actionItem }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
