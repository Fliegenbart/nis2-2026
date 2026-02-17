import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuditAccess } from "@/lib/audit-access";
import { unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string; evidenceId: string }> }
) {
  try {
    const { auditId, evidenceId } = await params;
    const access = await ensureAuditAccess(request, auditId, "write");
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const existing = await prisma.evidence.findFirst({
      where: { id: evidenceId, auditId },
      select: { id: true, url: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
    }

    await prisma.evidence.delete({ where: { id: evidenceId } });

    if (existing.url.startsWith("/uploads/")) {
      const filePath = join(process.cwd(), "public", existing.url.slice(1));
      await unlink(filePath).catch(() => undefined);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
