import { NextRequest, NextResponse } from "next/server";
import {
  CONSULTANT_READ_ROLES,
  CONSULTANT_WRITE_ROLES,
  requireAuthWithRoles,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthWithRoles(request, CONSULTANT_READ_ROLES);
    if (!user.organizationId) {
      return NextResponse.json({ clients: [] });
    }

    const clients = await prisma.client.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { audits: true },
        },
      },
    });

    return NextResponse.json({ clients });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthWithRoles(request, CONSULTANT_WRITE_ROLES);
    if (!user.organizationId) {
      return NextResponse.json({ error: "Missing organization context" }, { status: 400 });
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        name,
        companyName: typeof body.companyName === "string" ? body.companyName : null,
        industry: typeof body.industry === "string" ? body.industry : null,
        logoUrl: typeof body.logoUrl === "string" ? body.logoUrl : null,
        organizationId: user.organizationId,
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
