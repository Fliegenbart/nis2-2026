import test from "node:test";
import assert from "node:assert/strict";
import {
  createGuestAuditAccessToken,
  mergeGuestAuditIds,
  verifyGuestAuditAccessToken,
} from "@/lib/auth";

test("guest audit access token round-trips signed audit ids", () => {
  process.env.JWT_SECRET = "test-secret";

  const token = createGuestAuditAccessToken(["audit-a", "audit-b"]);
  const auditIds = verifyGuestAuditAccessToken(token);

  assert.deepEqual(auditIds, ["audit-a", "audit-b"]);
});

test("mergeGuestAuditIds deduplicates and keeps newest audit ids", () => {
  const deduplicatedAuditIds = mergeGuestAuditIds(
    Array.from({ length: 25 }, (_, index) => `audit-${index}`),
    "audit-5"
  );

  assert.equal(deduplicatedAuditIds.length, 25);
  assert.equal(
    deduplicatedAuditIds[deduplicatedAuditIds.length - 1],
    "audit-5"
  );
  assert.equal(
    deduplicatedAuditIds.filter((auditId) => auditId === "audit-5").length,
    1
  );

  const cappedAuditIds = mergeGuestAuditIds(deduplicatedAuditIds, "audit-new");
  assert.equal(cappedAuditIds.length, 25);
  assert.equal(cappedAuditIds[cappedAuditIds.length - 1], "audit-new");
  assert.ok(!cappedAuditIds.includes("audit-0"));
});
