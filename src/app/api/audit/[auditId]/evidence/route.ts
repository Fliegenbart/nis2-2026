import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { ensureAuditAccess } from "@/lib/audit-access";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string }> }
) {
  try {
    const { auditId } = await params;
    const access = await ensureAuditAccess(request, auditId);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const evidences = await prisma.evidence.findMany({
      where: { auditId },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({ evidences });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ auditId: string }> }
  ) {
  try {
    const { auditId } = await params;
    const access = await ensureAuditAccess(request, auditId);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const audit = await prisma.audit.findUnique({ where: { id: auditId } });
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const questionId = formData.get("questionId") as string | null;

    if (!file || !questionId) {
      return NextResponse.json(
        { error: "File and questionId required" },
        { status: 400 }
      );
    }
    if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Invalid file size (max 10 MB)" },
        { status: 400 }
      );
    }
    if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    const uploadDir = join(process.cwd(), "public", "uploads", auditId);
    await mkdir(uploadDir, { recursive: true });

    const extMatch = file.name.toLowerCase().match(/\.([a-z0-9]{1,10})$/);
    const ext = extMatch ? extMatch[1] : "bin";
    const savedName = `${randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    await writeFile(join(uploadDir, savedName), bytes);

    const evidence = await prisma.evidence.create({
      data: {
        filename: file.name,
        url: `/uploads/${auditId}/${savedName}`,
        mimeType: file.type || null,
        auditId,
        questionId,
      },
    });

    return NextResponse.json({ evidence }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
