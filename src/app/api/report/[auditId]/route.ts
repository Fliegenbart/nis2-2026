import { NextRequest, NextResponse } from "next/server";
import { ensureAuditAccess } from "@/lib/audit-access";
import { generateAuditReport } from "@/lib/audit-report-service";

const REPORT_GENERATION_TIMEOUT_MS = 12_000;

async function withTimeout<T>(
  task: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`${operation} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([task, timeoutPromise]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
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

    // TODO: In next sprint, offload this to a background worker (BullMQ/Inngest)
    // and serve report download from object storage with signed URLs.
    const report = await withTimeout(
      generateAuditReport(auditId),
      REPORT_GENERATION_TIMEOUT_MS,
      "Audit report generation"
    );
    if (!report) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    const arrayBuffer = report.pdfBytes.buffer.slice(
      report.pdfBytes.byteOffset,
      report.pdfBytes.byteOffset + report.pdfBytes.byteLength
    ) as ArrayBuffer;

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${report.fileName}"`,
        "X-Audit-Snapshot-Id": report.snapshotId,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("timed out")) {
      return NextResponse.json(
        { error: "Report generation timed out. Please try again." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
