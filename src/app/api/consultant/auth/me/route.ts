import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ensureUserOrganization } from "@/lib/organization";

export async function GET(request: NextRequest) {
  const user = await getSession(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const organizationId = await ensureUserOrganization({
    userId: user.id,
    organizationId: user.organizationId ?? null,
    preferredName: user.companyName || `${user.name} Compliance`,
  });

  return NextResponse.json({
    user: {
      ...user,
      organizationId,
    },
  });
}
