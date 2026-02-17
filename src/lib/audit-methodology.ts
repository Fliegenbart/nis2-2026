import type { Severity } from "@/data/nis2-framework";

export const FRAMEWORK_VERSION = "nis2-2026-v1";
export const METHODOLOGY_VERSION = "methodology-v1";

export const METHODOLOGY_NAME = "NIS2 Readiness Assessment";

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  kritisch: 5,
  hoch: 3,
  mittel: 1,
};

export const ANSWER_WEIGHT = {
  fulfilled: 1,
  partial: 0.5,
  not_fulfilled: 0,
  not_applicable: null,
} as const;

export const AUDIT_ROLES = [
  "admin",
  "consultant",
  "reviewer",
  "client_readonly",
] as const;

export type AuditRole = (typeof AUDIT_ROLES)[number];

export function getMethodologyManifest() {
  return {
    frameworkVersion: FRAMEWORK_VERSION,
    methodologyVersion: METHODOLOGY_VERSION,
    methodologyName: METHODOLOGY_NAME,
    severityWeight: SEVERITY_WEIGHT,
    answerWeight: ANSWER_WEIGHT,
  };
}
