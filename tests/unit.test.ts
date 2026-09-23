import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emailError,
  nicknameError,
  validateRegistration,
} from "../src/lib/validation";
import {
  canJoin,
  progress,
  setParticipation,
} from "../src/features/actions/participation";
test("registration requires valid minimal fields and consent", () => {
  assert.equal(
    validateRegistration("neighbour@example.com", "Neighbour", true),
    null,
  );
  assert.ok(emailError("missing-at"));
  assert.ok(emailError("a".repeat(255) + "@example.com"));
  assert.ok(validateRegistration("a@b.uk", "Neighbour", false));
  assert.ok(nicknameError("<script>alert(1)</script>"));
  assert.ok(nicknameError("x"));
  assert.equal(nicknameError("Émilie_7"), null);
});
test("joining is idempotent and leaving does not affect other actions", () => {
  assert.deepEqual(setParticipation(["one"], "one", true, "active"), ["one"]);
  assert.deepEqual(setParticipation(["one", "two"], "one", false, "active"), [
    "two",
  ]);
  assert.deepEqual(setParticipation([], "one", false, "completed"), []);
});
test("closed and proposed campaigns cannot be joined", () => {
  for (const status of [
    "completed",
    "cancelled",
    "proposed",
    "voting",
  ] as const) {
    assert.equal(canJoin(status), false);
    assert.throws(() => setParticipation([], "one", true, status));
  }
  assert.equal(canJoin("scheduled"), true);
});
test("threshold display stays bounded", () => {
  assert.equal(progress(120, 100), 100);
  assert.equal(progress(-1, 100), 0);
  assert.equal(progress(2, 0), 0);
  assert.equal(progress(74, 100), 74);
});
