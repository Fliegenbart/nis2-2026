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
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({ organization });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuthWithRoles(request, CONSULTANT_WRITE_ROLES);
    if (!user.organizationId) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const organization = await prisma.organization.update({
      where: { id: user.organizationId },
      data: { name },
      select: {
        id: true,
        name: true,
        slug: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ organization });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
