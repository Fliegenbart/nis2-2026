import { NextRequest } from "next/server";
import {
  CONSULTANT_READ_ROLES,
  CONSULTANT_WRITE_ROLES,
  getSession,
  hasGuestAuditAccess,
  hasRole,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AccessErrorStatus = 401 | 403 | 404;
type AccessMode = "read" | "write";

export type AuditAccessResult =
  | {
      ok: true;
      auditId: string;
      userId: string | null;
    }
  | {
      ok: false;
      status: AccessErrorStatus;
      error: string;
    };

export async function ensureAuditAccess(
  request: NextRequest,
  auditId: string,
  mode: AccessMode = "read"
): Promise<AuditAccessResult> {
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    select: { id: true, userId: true, organizationId: true },
  });

  if (!audit) {
    return { ok: false, status: 404, error: "Audit not found" };
  }

  if (audit.userId) {
    const user = await getSession(request);
    if (!user) {
      return { ok: false, status: 401, error: "Unauthorized" };
    }

    if (user.id === audit.userId) {
      return { ok: true, auditId: audit.id, userId: audit.userId };
    }

    if (
      !audit.organizationId ||
      !user.organizationId ||
      user.organizationId !== audit.organizationId
    ) {
      return { ok: false, status: 403, error: "Forbidden" };
    }

    if (mode === "write" && !hasRole(user, CONSULTANT_WRITE_ROLES)) {
      return { ok: false, status: 403, error: "Forbidden" };
    }
    if (mode === "read" && !hasRole(user, CONSULTANT_READ_ROLES)) {
      return { ok: false, status: 403, error: "Forbidden" };
    }

    return { ok: true, auditId: audit.id, userId: audit.userId };
  }

  const siteAuth = request.cookies.get("site-auth")?.value;
  if (siteAuth !== "authenticated") {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  if (!hasGuestAuditAccess(request, audit.id)) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return { ok: true, auditId: audit.id, userId: null };
}
