import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";
import { prisma } from "./prisma";

const COOKIE_NAME = "consultant-session";
const GUEST_AUDIT_COOKIE_NAME = "guest-audit-access";
const GUEST_AUDIT_MAX_IDS = 25;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) {
    return secret;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET env var is required in production");
  }
  throw new Error("JWT_SECRET env var is required");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(userId: string): string {
  const secret = getJwtSecret();
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string } | null {
  const secret = getJwtSecret();
  try {
    return jwt.verify(token, secret) as { userId: string };
  } catch {
    return null;
  }
}

interface GuestAuditAccessPayload {
  type: "guest-audit-access";
  auditIds: string[];
}

export function mergeGuestAuditIds(
  currentAuditIds: string[],
  auditId: string
): string[] {
  const uniqueAuditIds = currentAuditIds.filter(
    (currentAuditId) => currentAuditId !== auditId
  );

  uniqueAuditIds.push(auditId);

  return uniqueAuditIds.slice(-GUEST_AUDIT_MAX_IDS);
}

export function createGuestAuditAccessToken(auditIds: string[]): string {
  const secret = getJwtSecret();
  const payload: GuestAuditAccessPayload = {
    type: "guest-audit-access",
    auditIds: auditIds.filter(Boolean),
  };

  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyGuestAuditAccessToken(token: string): string[] | null {
  const secret = getJwtSecret();

  try {
    const payload = jwt.verify(token, secret) as Partial<GuestAuditAccessPayload>;
    if (
      payload.type !== "guest-audit-access" ||
      !Array.isArray(payload.auditIds) ||
      payload.auditIds.some((auditId) => typeof auditId !== "string")
    ) {
      return null;
    }

    return payload.auditIds;
  } catch {
    return null;
  }
}

export function getGuestAuditIds(request: NextRequest): string[] {
  const token = request.cookies.get(GUEST_AUDIT_COOKIE_NAME)?.value;
  if (!token) {
    return [];
  }

  return verifyGuestAuditAccessToken(token) ?? [];
}

export function hasGuestAuditAccess(
  request: NextRequest,
  auditId: string
): boolean {
  return getGuestAuditIds(request).includes(auditId);
}

export function grantGuestAuditAccess(
  request: NextRequest,
  response: NextResponse,
  auditId: string
): void {
  const mergedAuditIds = mergeGuestAuditIds(getGuestAuditIds(request), auditId);

  response.cookies.set(
    GUEST_AUDIT_COOKIE_OPTIONS.name,
    createGuestAuditAccessToken(mergedAuditIds),
    {
      httpOnly: GUEST_AUDIT_COOKIE_OPTIONS.httpOnly,
      secure: GUEST_AUDIT_COOKIE_OPTIONS.secure,
      sameSite: GUEST_AUDIT_COOKIE_OPTIONS.sameSite,
      maxAge: GUEST_AUDIT_COOKIE_OPTIONS.maxAge,
      path: GUEST_AUDIT_COOKIE_OPTIONS.path,
    }
  );
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyName: string | null;
  logoUrl: string | null;
  organizationId: string | null;
}

export async function getSession(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      companyName: true,
      logoUrl: true,
      organizationId: true,
    },
  });

  return user as SessionUser | null;
}

export async function requireAuth(request: NextRequest) {
  const user = await getSession(request);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export function hasRole(user: SessionUser, roles: readonly UserRole[]): boolean {
  return roles.includes(user.role);
}

export async function requireAuthWithRoles(
  request: NextRequest,
  roles: readonly UserRole[]
): Promise<SessionUser> {
  const user = await requireAuth(request);
  if (!hasRole(user, roles)) {
    throw new Error("Forbidden");
  }
  return user;
}

export const CONSULTANT_READ_ROLES: readonly UserRole[] = [
  "admin",
  "consultant",
  "reviewer",
];

export const CONSULTANT_WRITE_ROLES: readonly UserRole[] = [
  "admin",
  "consultant",
];

export const SESSION_COOKIE_OPTIONS = {
  name: COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};

export const GUEST_AUDIT_COOKIE_OPTIONS = {
  name: GUEST_AUDIT_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};
