import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CONSULTANT_WRITE_ROLES,
  requireAuthWithRoles,
} from "@/lib/auth";
import { FRAMEWORK_VERSION, METHODOLOGY_VERSION } from "@/lib/audit-methodology";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthWithRoles(request, CONSULTANT_WRITE_ROLES);
    const body = await request.json();

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "Missing organization context" },
        { status: 400 }
      );
    }

    let linkedClient: {
      id: string;
      name: string;
      companyName: string | null;
      industry: string | null;
    } | null = null;
    if (body.clientId) {
      linkedClient = await prisma.client.findFirst({
        where: { id: body.clientId, organizationId: user.organizationId },
        select: { id: true, name: true, companyName: true, industry: true },
      });
      if (!linkedClient) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 });
      }
    }

    const clientName = body.clientName || linkedClient?.name;
    if (!clientName) {
      return NextResponse.json(
        { error: "clientName is required" },
        { status: 400 }
      );
    }

    const audit = await prisma.audit.create({
      data: {
        clientName,
        companyName: body.companyName || linkedClient?.companyName || null,
        industry: body.industry || linkedClient?.industry || null,
        locale: "de",
        isPremium: true,
        userId: user.id,
        frameworkVersion: FRAMEWORK_VERSION,
        methodologyVersion: METHODOLOGY_VERSION,
        organizationId: user.organizationId,
        clientId: linkedClient?.id || null,
      },
    });

    return NextResponse.json({ audit }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
