import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadCaptureSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = leadCaptureSchema.parse(body);

    const audit = await prisma.audit.findUnique({
      where: { id: data.auditId },
    });
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
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
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
