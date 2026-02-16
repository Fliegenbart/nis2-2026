import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ auditId: string }> }
) {
  try {
    const { auditId } = await params;

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

    const uploadDir = join(process.cwd(), "public", "uploads", auditId);
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop() || "bin";
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
