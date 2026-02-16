import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    if (!body.clientName) {
      return NextResponse.json(
        { error: "clientName is required" },
        { status: 400 }
      );
    }

    const audit = await prisma.audit.create({
      data: {
        clientName: body.clientName,
        companyName: body.companyName || null,
        industry: body.industry || null,
        locale: "de",
        isPremium: true,
        userId: user.id,
      },
    });

    return NextResponse.json({ audit }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
