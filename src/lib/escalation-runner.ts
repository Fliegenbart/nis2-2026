import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export interface EscalationTarget {
  channel: string;
  url: string;
}

export interface EscalationRunResult {
  scanned: number;
  targets: number;
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
}

export interface EscalationRunOptions {
  limit?: number;
  dryRun?: boolean;
  now?: Date;
}

export function parseEscalationTargets(raw: string | undefined): EscalationTarget[] {
  if (!raw) return [];

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const equalIndex = item.indexOf("=");
      if (equalIndex > 0) {
        const channel = item.slice(0, equalIndex).trim() || "webhook";
        const url = item.slice(equalIndex + 1).trim();
        return { channel, url };
      }
      return { channel: "webhook", url: item };
    })
    .filter((target) => target.url.startsWith("http://") || target.url.startsWith("https://"));
}

function buildFingerprint(findingId: string, targetUrl: string, dateKey: string): string {
  return createHash("sha256")
    .update(`${findingId}|${targetUrl}|${dateKey}`)
    .digest("hex");
}

export async function runOverdueEscalations(
  options: EscalationRunOptions = {}
): Promise<EscalationRunResult> {
  const now = options.now ?? new Date();
  const limit = options.limit ?? 200;
  const dryRun = options.dryRun ?? false;
  const dateKey = now.toISOString().slice(0, 10);

  const targets = parseEscalationTargets(process.env.ESCALATION_WEBHOOK_URLS);
  const overdueFindings = await prisma.finding.findMany({
    where: {
      status: { not: "closed" },
      dueDate: { lt: now },
    },
    include: {
      audit: {
        select: {
          id: true,
          clientName: true,
          companyName: true,
          organizationId: true,
        },
      },
      reviewOwner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
    take: limit,
  });

  const result: EscalationRunResult = {
    scanned: overdueFindings.length,
    targets: targets.length,
    attempted: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  };

  if (targets.length === 0) {
    return result;
  }

  for (const finding of overdueFindings) {
    for (const target of targets) {
      const fingerprint = buildFingerprint(finding.id, target.url, dateKey);

      const existing = await prisma.findingEscalationEvent.findUnique({
        where: { fingerprint },
        select: { id: true },
      });
      if (existing) {
        result.skipped += 1;
        continue;
      }

      result.attempted += 1;

      const payload = {
        type: "NIS2_OVERDUE_FINDING",
        happenedAt: now.toISOString(),
        audit: {
          id: finding.audit.id,
          clientName: finding.audit.clientName,
          companyName: finding.audit.companyName,
          organizationId: finding.audit.organizationId,
        },
        finding: {
          id: finding.id,
          title: finding.title,
          severity: finding.severity,
          status: finding.status,
          dueDate: finding.dueDate?.toISOString() || null,
          reviewOwner: finding.reviewOwner
            ? {
                id: finding.reviewOwner.id,
                name: finding.reviewOwner.name,
                email: finding.reviewOwner.email,
                role: finding.reviewOwner.role,
              }
            : null,
        },
      };

      let success = false;
      let responseStatus: number | null = null;
      let errorMessage: string | null = null;

      if (!dryRun) {
        try {
          const response = await fetch(target.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          responseStatus = response.status;
          success = response.ok;
          if (!response.ok) {
            errorMessage = `HTTP ${response.status}`;
          }
        } catch (error) {
          errorMessage = error instanceof Error ? error.message : "Unknown error";
        }
      }

      await prisma.findingEscalationEvent.create({
        data: {
          findingId: finding.id,
          channel: target.channel,
          deliveryTarget: target.url,
          escalationDate: new Date(`${dateKey}T00:00:00.000Z`),
          statusSnapshot: finding.status,
          dueDateSnapshot: finding.dueDate,
          success,
          responseStatus,
          errorMessage,
          payload,
          fingerprint,
        },
      });

      if (dryRun || success) {
        result.sent += 1;
      } else {
        result.failed += 1;
      }
    }
  }

  return result;
}
