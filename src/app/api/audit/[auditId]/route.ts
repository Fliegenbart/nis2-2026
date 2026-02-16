import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateAuditSchema } from "@/lib/validators";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ auditId: string }> }
) {
  try {
    const { auditId } = await params;

    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      include: { answers: true, lead: true },
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    return NextResponse.json(audit);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ auditId: string }> }
) {
  try {
    const { auditId } = await params;
    const body = await request.json();
    const data = updateAuditSchema.parse(body);

    const audit = await prisma.audit.update({
      where: { id: auditId },
      data,
    });

    return NextResponse.json(audit);
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
