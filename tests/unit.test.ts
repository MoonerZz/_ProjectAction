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

import {
  searchMembers,
  getMemberDetails,
  parseVotes,
  parseInterests,
  lookupError,
} from "../src/lib/parliament";
const apiMember = {
  id: 5257,
  nameDisplayAs: "Example MP",
  latestParty: { name: "Example party" },
  latestHouseMembership: {
    house: 1,
    membershipEndDate: null,
    membershipFrom: "Example constituency",
  },
};
test("Parliament searches are not cached or echoed and exclude former MPs", async () => {
  let calls = 0;
  const fake: typeof fetch = async (url, options) => {
    calls++;
    assert.equal(options?.cache, "no-store");
    assert.equal(new URL(String(url)).searchParams.get("Location"), "SW1A 0AA");
    return Response.json({
      items: [
        { value: apiMember },
        {
          value: {
            ...apiMember,
            latestHouseMembership: {
              ...apiMember.latestHouseMembership,
              membershipEndDate: "2024-01-01",
            },
          },
        },
      ],
      totalResults: 2,
      resultContext: "postcode SW1A 0AA",
    });
  };
  const result = await searchMembers("SW1A 0AA", fake);
  assert.equal(result.members.length, 1);
  assert.equal(JSON.stringify(result).includes("SW1A"), false);
  await assert.rejects(searchMembers("<script>", fake));
  assert.equal(calls, 1);
  assert.ok(lookupError("x"));
});
test("Parliament outages remain distinct from empty records", async () => {
  const fake: typeof fetch = async (url, options) => {
    assert.equal(
      (options as RequestInit & { next: { revalidate: number } }).next
        .revalidate,
      3600,
    );
    if (String(url).includes("Voting"))
      return new Response("", { status: 429 });
    if (String(url).includes("RegisteredInterests"))
      return Response.json({ value: [] });
    return Response.json({ value: apiMember });
  };
  const details = await getMemberDetails(5257, fake);
  assert.equal(details.votes, null);
  assert.deepEqual(details.interests, []);
  await assert.rejects(getMemberDetails(-1, fake));
});
test("Votes preserve teller status and never infer abstention", () => {
  const base = {
    id: 1,
    title: "An amendment",
    date: "2026-01-01",
    inAffirmativeLobby: false,
    inNegativeLobby: false,
    actedAsTeller: false,
  };
  assert.equal(
    parseVotes({ items: [{ value: base }] })[0].position,
    "No clear voting position recorded",
  );
  assert.equal(
    parseVotes({
      items: [
        { value: { ...base, inAffirmativeLobby: true, actedAsTeller: true } },
      ],
    })[0].position,
    "Aye · Teller",
  );
  assert.throws(() =>
    parseVotes({ items: [{ value: { ...base, date: "invalid" } }] }),
  );
});
test("Interests include child records but exclude deleted entries", () => {
  const result = parseInterests({
    value: [
      {
        name: "Category",
        interests: [
          {
            id: 1,
            interest: "Parent",
            childInterests: [{ id: 2, interest: "Child" }],
          },
          { id: 3, interest: "Removed", deletedWhen: "2026-01-01" },
        ],
      },
    ],
  });
  assert.deepEqual(
    result.map((x) => x.id),
    [1, 2],
  );
});
