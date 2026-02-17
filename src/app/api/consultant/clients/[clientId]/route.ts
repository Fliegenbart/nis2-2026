import { NextRequest, NextResponse } from "next/server";
import { CONSULTANT_WRITE_ROLES, requireAuthWithRoles } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const user = await requireAuthWithRoles(request, CONSULTANT_WRITE_ROLES);
    if (!user.organizationId) {
      return NextResponse.json({ error: "Missing organization context" }, { status: 400 });
    }

    const { clientId } = await params;
    const existing = await prisma.client.findFirst({
      where: { id: clientId, organizationId: user.organizationId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const body = await request.json();
    const data: {
      name?: string;
      companyName?: string | null;
      industry?: string | null;
      logoUrl?: string | null;
    } = {};

    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name) {
        return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
      }
      data.name = name;
    }
    if (body.companyName !== undefined) {
      data.companyName = typeof body.companyName === "string" ? body.companyName : null;
    }
    if (body.industry !== undefined) {
      data.industry = typeof body.industry === "string" ? body.industry : null;
    }
    if (body.logoUrl !== undefined) {
      data.logoUrl = typeof body.logoUrl === "string" ? body.logoUrl : null;
    }

    const client = await prisma.client.update({
      where: { id: clientId },
      data,
    });

    return NextResponse.json({ client });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const user = await requireAuthWithRoles(request, CONSULTANT_WRITE_ROLES);
    if (!user.organizationId) {
      return NextResponse.json({ error: "Missing organization context" }, { status: 400 });
    }

    const { clientId } = await params;
    const deleted = await prisma.client.deleteMany({
      where: { id: clientId, organizationId: user.organizationId },
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
