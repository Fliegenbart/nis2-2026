import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";

import { seedControlCatalog } from "../prisma/seed";
import { calculateRiskProfileForAuditV1 } from "../src/lib/risk-engine";
import {
  FRAMEWORK_VERSION,
  METHODOLOGY_VERSION,
} from "../src/lib/audit-methodology";

const hasDatabase = Boolean(process.env.DATABASE_URL);

test(
  "risk engine escalates high-revenue audits using database-backed fixtures",
  { skip: !hasDatabase },
  async () => {
    const prisma = new PrismaClient();
    const auditIds: string[] = [];

    try {
      await seedControlCatalog(prisma);

      const controls = await prisma.controlCatalog.findMany({
        where: {
          frameworkVersion: FRAMEWORK_VERSION,
          methodologyVersion: METHODOLOGY_VERSION,
          weight: 5,
        },
        orderBy: { questionId: "asc" },
        take: 2,
      });
      assert.equal(controls.length, 2);

      async function createAuditFixture(revenue: number) {
        const audit = await prisma.audit.create({
          data: {
            locale: "de",
            revenue,
            employeeCount: 120,
            frameworkVersion: FRAMEWORK_VERSION,
            methodologyVersion: METHODOLOGY_VERSION,
          },
        });
        auditIds.push(audit.id);

        await prisma.answer.createMany({
          data: [
            {
              auditId: audit.id,
              questionId: controls[0].questionId,
              categoryId: controls[0].categoryId,
              value: "fulfilled",
            },
            {
              auditId: audit.id,
              questionId: controls[1].questionId,
              categoryId: controls[1].categoryId,
              value: "not_fulfilled",
            },
          ],
        });

        const riskProfile = await calculateRiskProfileForAuditV1(audit.id, prisma);
        assert.ok(riskProfile);
        assert.ok(riskProfile.input.overallScore <= 55);
        return riskProfile;
      }

      const lowRevenueRisk = await createAuditFixture(10_000_000);
      const highRevenueRisk = await createAuditFixture(60_000_000);

      assert.equal(lowRevenueRisk.level, "high");
      assert.equal(highRevenueRisk.level, "critical");
      assert.ok(
        highRevenueRisk.rationale.includes("High revenue exposure with sub-70 score")
      );
    } finally {
      for (const auditId of auditIds) {
        await prisma.audit.delete({ where: { id: auditId } });
      }
      await prisma.$disconnect();
    }
  }
);
