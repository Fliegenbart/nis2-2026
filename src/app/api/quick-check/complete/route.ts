import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { grantGuestAuditAccess } from "@/lib/auth";
import { completeQuickCheckSchema } from "@/lib/validators";
import { FRAMEWORK_VERSION, METHODOLOGY_VERSION } from "@/lib/audit-methodology";
import { ensureComplianceArtifactsForAudit } from "@/lib/compliance-program";

export async function POST(request: NextRequest) {
  try {
    const siteAuth = request.cookies.get("site-auth")?.value;
    if (siteAuth !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = completeQuickCheckSchema.parse(body);

    const audit = await prisma.$transaction(async (tx) => {
      const createdAudit = await tx.audit.create({
        data: {
          companyName: data.companyName,
          locale: data.locale,
          frameworkVersion: FRAMEWORK_VERSION,
          methodologyVersion: METHODOLOGY_VERSION,
        },
      });

      await tx.answer.createMany({
        data: data.answers.map((answer) => ({
          auditId: createdAudit.id,
          questionId: answer.questionId,
          categoryId: answer.categoryId,
          value: answer.value,
          notes: answer.notes,
        })),
      });

      await tx.lead.create({
        data: {
          email: data.email,
          companyName: data.companyName,
          consent: data.consent,
          auditId: createdAudit.id,
        },
      });

      return createdAudit;
    });

    const response = NextResponse.json({ id: audit.id }, { status: 201 });
    grantGuestAuditAccess(request, response, audit.id);
    await ensureComplianceArtifactsForAudit(audit.id);
    return response;
  } catch (error) {
    console.error("POST /api/quick-check/complete failed:", error);

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
