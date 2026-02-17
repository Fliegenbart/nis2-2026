import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import {
  CONSULTANT_READ_ROLES,
  requireAuthWithRoles,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ReviewScope = "my" | "queue" | "all";

type SortMode = "due_asc" | "due_desc" | "updated_desc" | "severity_desc";
type FindingStatusParam = "draft" | "in_review" | "approved" | "closed";
type FindingSeverityParam = "critical" | "high" | "medium" | "low";

function parseScope(value: string | null, defaultScope: ReviewScope): ReviewScope {
  if (value === "my" || value === "queue" || value === "all") {
    return value;
  }
  return defaultScope;
}

function parseSort(value: string | null): SortMode {
  if (
    value === "due_asc" ||
    value === "due_desc" ||
    value === "updated_desc" ||
    value === "severity_desc"
  ) {
    return value;
  }
  return "due_asc";
}

function isFindingStatus(value: string | null): value is FindingStatusParam {
  return value === "draft" || value === "in_review" || value === "approved" || value === "closed";
}

function isFindingSeverity(value: string | null): value is FindingSeverityParam {
  return value === "critical" || value === "high" || value === "medium" || value === "low";
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthWithRoles(request, CONSULTANT_READ_ROLES);
    if (!user.organizationId) {
      return NextResponse.json({ reviews: [], summary: null });
    }

    const search = request.nextUrl.searchParams;
    const defaultScope: ReviewScope = user.role === "reviewer" ? "my" : "all";
    const scope = parseScope(search.get("scope"), defaultScope);
    const sort = parseSort(search.get("sort"));
    const overdueOnly = search.get("overdue") === "1";

    const status = search.get("status");
    const severity = search.get("severity");

    const where: Prisma.FindingWhereInput = {
      audit: {
        organizationId: user.organizationId,
      },
    };

    if (isFindingStatus(status)) {
      where.status = status;
    }
    if (isFindingSeverity(severity)) {
      where.severity = severity;
    }

    if (scope === "my") {
      where.reviewOwnerUserId = user.id;
    } else if (scope === "queue") {
      where.status = "in_review";
      where.reviewOwnerUserId = null;
    }

    if (overdueOnly) {
      where.dueDate = { lt: new Date() };
      where.status = { not: "closed" };
    }

    let orderBy: Prisma.FindingOrderByWithRelationInput[];
    if (sort === "due_desc") {
      orderBy = [{ dueDate: "desc" }, { updatedAt: "desc" }];
    } else if (sort === "updated_desc") {
      orderBy = [{ updatedAt: "desc" }];
    } else if (sort === "severity_desc") {
      orderBy = [{ severity: "asc" }, { dueDate: "asc" }, { updatedAt: "desc" }];
    } else {
      orderBy = [{ dueDate: "asc" }, { updatedAt: "desc" }];
    }

    const reviews = await prisma.finding.findMany({
      where,
      include: {
        audit: {
          select: {
            id: true,
            clientName: true,
            companyName: true,
            industry: true,
          },
        },
        createdBy: {
          select: { id: true, name: true, role: true },
        },
        reviewedBy: {
          select: { id: true, name: true, role: true },
        },
        reviewOwner: {
          select: { id: true, name: true, role: true },
        },
        _count: {
          select: {
            comments: true,
            actionItems: true,
          },
        },
      },
      orderBy,
      take: 200,
    });

    const summary = {
      total: reviews.length,
      inReview: reviews.filter((item) => item.status === "in_review").length,
      overdue: reviews.filter(
        (item) => item.status !== "closed" && item.dueDate && item.dueDate.getTime() < Date.now()
      ).length,
      criticalOpen: reviews.filter(
        (item) => item.status !== "closed" && item.severity === "critical"
      ).length,
    };

    return NextResponse.json({ reviews, summary });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
