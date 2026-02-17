import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { saveAnswersSchema } from "@/lib/validators";
import { ensureAuditAccess } from "@/lib/audit-access";

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
    const { answers } = saveAnswersSchema.parse(body);

    const audit = await prisma.audit.findUnique({ where: { id: auditId } });
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    const results = await Promise.all(
      answers.map((answer) =>
        prisma.answer.upsert({
          where: {
            auditId_questionId: {
              auditId,
              questionId: answer.questionId,
            },
          },
          create: {
            auditId,
            questionId: answer.questionId,
            categoryId: answer.categoryId,
            value: answer.value,
            notes: answer.notes,
          },
          update: {
            value: answer.value,
            categoryId: answer.categoryId,
            notes: answer.notes,
          },
        })
      )
    );

    return NextResponse.json({ saved: results.length });
  } catch (error) {
    console.error("POST /api/audit/[auditId]/answers failed:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 503 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021" || error.code === "P2022") {
        return NextResponse.json(
          { error: "Database schema not up to date" },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
