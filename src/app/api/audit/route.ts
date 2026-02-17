import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createAuditSchema } from "@/lib/validators";
import { FRAMEWORK_VERSION, METHODOLOGY_VERSION } from "@/lib/audit-methodology";

export async function POST(request: NextRequest) {
  try {
    const siteAuth = request.cookies.get("site-auth")?.value;
    if (siteAuth !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createAuditSchema.parse(body);

    const audit = await prisma.audit.create({
      data: {
        companyName: data.companyName,
        revenue: data.revenue,
        employeeCount: data.employeeCount,
        industry: data.industry,
        locale: data.locale,
        frameworkVersion: FRAMEWORK_VERSION,
        methodologyVersion: METHODOLOGY_VERSION,
      },
    });

    return NextResponse.json({ id: audit.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/audit failed:", error);

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
