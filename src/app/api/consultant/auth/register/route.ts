import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken, SESSION_COOKIE_OPTIONS } from "@/lib/auth";
import { createOrganization } from "@/lib/organization";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, companyName, organizationName } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password and name required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const orgDisplayName =
      organizationName?.trim() ||
      companyName?.trim() ||
      `${name.trim()} Compliance`;

    const user = await prisma.$transaction(async (tx) => {
      const org = await createOrganization(orgDisplayName, tx);
      return tx.user.create({
        data: {
          email,
          passwordHash,
          name,
          companyName: companyName || null,
          organizationId: org.id,
          role: "admin",
        },
      });
    });

    const token = createToken(user.id);
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyName: user.companyName,
          organizationId: user.organizationId,
        },
      },
      { status: 201 }
    );

    response.cookies.set(SESSION_COOKIE_OPTIONS.name, token, {
      httpOnly: SESSION_COOKIE_OPTIONS.httpOnly,
      secure: SESSION_COOKIE_OPTIONS.secure,
      sameSite: SESSION_COOKIE_OPTIONS.sameSite,
      maxAge: SESSION_COOKIE_OPTIONS.maxAge,
      path: SESSION_COOKIE_OPTIONS.path,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
