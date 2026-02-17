import type {
  ActionPriority,
  ActionStatus,
  FindingCommentRole,
  FindingSeverity,
  FindingStatus,
  UserRole,
} from "@prisma/client";

export const ACTION_PRIORITIES: readonly ActionPriority[] = [
  "critical",
  "high",
  "medium",
  "low",
];

export const ACTION_STATUSES: readonly ActionStatus[] = [
  "open",
  "in_progress",
  "blocked",
  "done",
];

export const FINDING_STATUSES: readonly FindingStatus[] = [
  "draft",
  "in_review",
  "approved",
  "closed",
];

export const FINDING_SEVERITIES: readonly FindingSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
];

export const FINDING_COMMENT_ROLES: readonly FindingCommentRole[] = [
  "consultant",
  "reviewer",
  "client",
];

export function isActionPriority(value: unknown): value is ActionPriority {
  return typeof value === "string" && ACTION_PRIORITIES.includes(value as ActionPriority);
}

export function isActionStatus(value: unknown): value is ActionStatus {
  return typeof value === "string" && ACTION_STATUSES.includes(value as ActionStatus);
}

export function isFindingStatus(value: unknown): value is FindingStatus {
  return typeof value === "string" && FINDING_STATUSES.includes(value as FindingStatus);
}

export function isFindingSeverity(value: unknown): value is FindingSeverity {
  return typeof value === "string" && FINDING_SEVERITIES.includes(value as FindingSeverity);
}

export function getCommentRoleForUserRole(userRole: UserRole): FindingCommentRole {
  if (userRole === "reviewer") {
    return "reviewer";
  }
  if (userRole === "client_readonly") {
    return "client";
  }
  return "consultant";
}

const FINDING_TRANSITIONS: Record<FindingStatus, readonly FindingStatus[]> = {
  draft: ["draft", "in_review"],
  in_review: ["draft", "in_review", "approved"],
  approved: ["in_review", "approved", "closed"],
  closed: ["closed"],
};

export function canTransitionFindingStatus(
  from: FindingStatus,
  to: FindingStatus
): boolean {
  return FINDING_TRANSITIONS[from].includes(to);
}

export function parseOptionalDate(value: unknown): Date | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed;
}
