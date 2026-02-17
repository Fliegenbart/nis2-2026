import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import type { UserRole } from "@prisma/client";
import { prisma } from "./prisma";

const COOKIE_NAME = "consultant-session";
const DEV_JWT_SECRET = randomBytes(32).toString("hex");

function getJwtSecret(): string {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET env var is required in production");
  }
  return DEV_JWT_SECRET;
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
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, getJwtSecret()) as { userId: string };
  } catch {
    return null;
  }
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
