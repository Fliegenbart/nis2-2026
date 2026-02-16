import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createAuditSchema.parse(body);

    const audit = await prisma.audit.create({
      data: {
        companyName: data.companyName,
        revenue: data.revenue,
        employeeCount: data.employeeCount,
        industry: data.industry,
        locale: data.locale,
      },
    });

    return NextResponse.json({ id: audit.id }, { status: 201 });
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
