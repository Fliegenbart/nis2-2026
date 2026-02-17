import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { leadCaptureSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const siteAuth = request.cookies.get("site-auth")?.value;
    if (siteAuth !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = leadCaptureSchema.parse(body);

    const audit = await prisma.audit.findUnique({
      where: { id: data.auditId },
      select: { id: true, userId: true },
    });
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }
    if (audit.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existingLead = await prisma.lead.findUnique({
      where: { auditId: data.auditId },
    });
    if (existingLead) {
      return NextResponse.json({ id: existingLead.id });
    }

    const lead = await prisma.lead.create({
      data: {
        email: data.email,
        companyName: data.companyName,
        consent: data.consent,
        auditId: data.auditId,
      },
    });

    return NextResponse.json({ id: lead.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads failed:", error);

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
