import { NextRequest, NextResponse } from "next/server";

function getSitePassword(): string {
  if (process.env.SITE_PASSWORD) {
    return process.env.SITE_PASSWORD;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("SITE_PASSWORD env var is required in production");
  }
  return "nis26-dev-only";
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const sitePassword = getSitePassword();

    if (password === sitePassword) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("site-auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
