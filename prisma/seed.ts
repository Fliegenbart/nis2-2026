import { PrismaClient } from "@prisma/client";
import { buildControlCatalog } from "@/lib/control-catalog";
import {
  FRAMEWORK_VERSION,
  METHODOLOGY_VERSION,
} from "@/lib/audit-methodology";

export interface SeedControlCatalogResult {
  seededCount: number;
  frameworkVersion: string;
  methodologyVersion: string;
}

export async function seedControlCatalog(
  prisma: PrismaClient
): Promise<SeedControlCatalogResult> {
  const controls = buildControlCatalog();
  if (controls.length === 0) {
    throw new Error("Control catalog build returned no controls");
  }

  const frameworkVersions = new Set(controls.map((c) => c.frameworkVersion));
  const methodologyVersions = new Set(controls.map((c) => c.methodologyVersion));
  if (frameworkVersions.size !== 1 || !frameworkVersions.has(FRAMEWORK_VERSION)) {
    throw new Error(
      `Control catalog frameworkVersion mismatch. Expected ${FRAMEWORK_VERSION}.`
    );
  }
  if (
    methodologyVersions.size !== 1 ||
    !methodologyVersions.has(METHODOLOGY_VERSION)
  ) {
    throw new Error(
      `Control catalog methodologyVersion mismatch. Expected ${METHODOLOGY_VERSION}.`
    );
  }

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

  return {
    seededCount: controls.length,
    frameworkVersion: FRAMEWORK_VERSION,
    methodologyVersion: METHODOLOGY_VERSION,
  };
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const result = await seedControlCatalog(prisma);
    console.log(
      `Seeded ${result.seededCount} controls (${result.frameworkVersion}, ${result.methodologyVersion}).`
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.includes("prisma/seed")) {
  main().catch((error) => {
    console.error("Prisma seed failed:", error);
    process.exit(1);
  });
}
