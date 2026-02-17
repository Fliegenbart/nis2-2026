import { NextRequest, NextResponse } from "next/server";
import { CONSULTANT_WRITE_ROLES, requireAuthWithRoles } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMethodologyManifest } from "@/lib/audit-methodology";

export async function GET(request: NextRequest) {
  const requestedFrameworkVersion =
    request.nextUrl.searchParams.get("frameworkVersion");

  const latestControl = await prisma.controlCatalog.findFirst({
    select: {
      frameworkVersion: true,
      methodologyVersion: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const frameworkVersion =
    requestedFrameworkVersion ?? latestControl?.frameworkVersion;
  if (!frameworkVersion) {
    return NextResponse.json(
      { error: "Control catalog is not seeded" },
      { status: 503 }
    );
  }

  const controls = await prisma.controlCatalog.findMany({
    where: { frameworkVersion },
    orderBy: [{ categoryId: "asc" }, { questionId: "asc" }],
  });
  if (controls.length === 0) {
    return NextResponse.json(
      { error: `No controls found for frameworkVersion=${frameworkVersion}` },
      { status: 404 }
    );
  }

  const manifest = getMethodologyManifest();
  const methodologyVersion = controls[0].methodologyVersion;

  return NextResponse.json({
    frameworkVersion,
    methodologyVersion,
    methodologyName: manifest.methodologyName,
    severityWeight: manifest.severityWeight,
    answerWeight: manifest.answerWeight,
    controlCount: controls.length,
    categories: Array.from(new Set(controls.map((c) => c.categoryId))).length,
    controls,
  });
}

export async function POST(request: NextRequest) {
  try {
    await requireAuthWithRoles(request, CONSULTANT_WRITE_ROLES);
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    {
      error:
        "Manual sync endpoint deprecated. Use `prisma db seed` to refresh ControlCatalog.",
    },
    { status: 405 }
  );
}
