import test from "node:test";
import assert from "node:assert/strict";

import {
  canTransitionFindingStatus,
  getCommentRoleForUserRole,
  parseOptionalDate,
} from "../src/lib/workflow";

test("finding workflow only allows defined status transitions", () => {
  assert.equal(canTransitionFindingStatus("draft", "in_review"), true);
  assert.equal(canTransitionFindingStatus("draft", "approved"), false);
  assert.equal(canTransitionFindingStatus("in_review", "approved"), true);
  assert.equal(canTransitionFindingStatus("approved", "closed"), true);
  assert.equal(canTransitionFindingStatus("closed", "in_review"), false);
});

test("comment role maps from user roles", () => {
  assert.equal(getCommentRoleForUserRole("admin"), "consultant");
  assert.equal(getCommentRoleForUserRole("consultant"), "consultant");
  assert.equal(getCommentRoleForUserRole("reviewer"), "reviewer");
  assert.equal(getCommentRoleForUserRole("client_readonly"), "client");
});

test("parseOptionalDate handles null, empty and invalid values", () => {
  assert.equal(parseOptionalDate(undefined), undefined);
  assert.equal(parseOptionalDate(null), null);
  assert.equal(parseOptionalDate(""), null);

  const parsed = parseOptionalDate("2026-02-17T12:00:00.000Z");
  assert.ok(parsed instanceof Date);
  assert.equal(parsed?.toISOString(), "2026-02-17T12:00:00.000Z");

  assert.equal(parseOptionalDate("not-a-date"), undefined);
  assert.equal(parseOptionalDate(42), undefined);
});
