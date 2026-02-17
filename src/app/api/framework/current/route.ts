import { NextRequest, NextResponse } from "next/server";
import { CONSULTANT_WRITE_ROLES, requireAuthWithRoles } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildControlCatalog } from "@/lib/control-catalog";
import { getMethodologyManifest } from "@/lib/audit-methodology";

export async function GET() {
  const manifest = getMethodologyManifest();
  const controls = buildControlCatalog();

  const dbControlCount = await prisma.controlCatalog.count({
    where: { frameworkVersion: manifest.frameworkVersion },
  });

  return NextResponse.json({
    ...manifest,
    controlCount: controls.length,
    dbControlCount,
    categories: Array.from(new Set(controls.map((c) => c.categoryId))).length,
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

  const controls = buildControlCatalog();
  await prisma.$transaction(
    controls.map((control) =>
      prisma.controlCatalog.upsert({
        where: {
          frameworkVersion_questionId: {
            frameworkVersion: control.frameworkVersion,
            questionId: control.questionId,
          },
        },
        update: {
          methodologyVersion: control.methodologyVersion,
          categoryId: control.categoryId,
          severity: control.severity,
          weight: control.weight,
          articleRef: control.articleRef,
          legalReference: control.legalReference,
          evidenceRequired: control.evidenceRequired,
        },
        create: control,
      })
    )
  );

  return NextResponse.json({
    synced: controls.length,
    frameworkVersion: controls[0]?.frameworkVersion,
  });
}
