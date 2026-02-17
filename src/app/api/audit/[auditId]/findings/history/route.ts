import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuditAccess } from "@/lib/audit-access";

function csvEscape(value: unknown): string {
  const raw = String(value ?? "");
  if (raw.includes(",") || raw.includes("\n") || raw.includes('"')) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string }> }
) {
  try {
    const { auditId } = await params;
    const access = await ensureAuditAccess(request, auditId, "read");
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") === "csv" ? "csv" : "json";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";

    const history = await prisma.findingStatusHistory.findMany({
      where: {
        finding: {
          auditId,
        },
      },
      include: {
        finding: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        changedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: order },
    });

    if (format === "csv") {
      const rows = [
        [
          "timestamp",
          "findingId",
          "findingTitle",
          "fromStatus",
          "toStatus",
          "changedById",
          "changedByName",
          "changedByRole",
          "note",
        ],
        ...history.map((entry) => [
          entry.createdAt.toISOString(),
          entry.findingId,
          entry.finding.title,
          entry.fromStatus || "",
          entry.toStatus,
          entry.changedBy?.id || "",
          entry.changedBy?.name || "",
          entry.changedBy?.role || "",
          entry.note || "",
        ]),
      ];

      const csv = `${rows
        .map((line) => line.map(csvEscape).join(","))
        .join("\n")}\n`;

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=\"finding-history-${auditId.slice(0, 8)}.csv\"`,
        },
      });
    }

    return NextResponse.json({ history });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
