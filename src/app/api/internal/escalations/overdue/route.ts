import { NextRequest, NextResponse } from "next/server";
import { runOverdueEscalations } from "@/lib/escalation-runner";

function isAuthorized(request: NextRequest): boolean {
  const configured = process.env.ESCALATION_RUNNER_TOKEN;
  if (!configured) {
    return process.env.NODE_ENV !== "production";
  }

  const token =
    request.headers.get("x-escalation-token") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";

  return token === configured;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limitParam = request.nextUrl.searchParams.get("limit");
    const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";
    const limit = limitParam ? Math.max(1, Math.min(1000, Number(limitParam))) : 200;

    const result = await runOverdueEscalations({
      limit: Number.isFinite(limit) ? limit : 200,
      dryRun,
    });

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
