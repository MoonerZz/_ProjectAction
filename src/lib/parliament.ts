export type Member = {
  id: number;
  name: string;
  party: string;
  constituency: string;
};
export type Vote = {
  id: number;
  title: string;
  date: string;
  position: string;
};
export type Interest = { id: number; category: string; text: string };
export type MemberDetails = {
  member: Member;
  votes: Vote[] | null;
  interests: Interest[] | null;
  checkedAt: string;
};
type Json = Record<string, unknown>;
function object(value: unknown): Json {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid record");
  return value as Json;
}
function list(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error("Invalid list");
  return value;
}
function text(value: unknown): string {
  if (typeof value !== "string") throw new Error("Invalid text");
  return value;
}
function id(value: unknown): number {
  if (!Number.isSafeInteger(value) || Number(value) < 1)
    throw new Error("Invalid ID");
  return Number(value);
}
export function lookupError(query: string): string | null {
  return query.length < 2 ||
    query.length > 100 ||
    !/^[\p{L}\p{N} '\-.,&()]+$/u.test(query)
    ? "Enter a UK postcode or constituency name (2–100 characters)."
    : null;
}
export function parseMember(raw: unknown): Member | null {
  const value = object(raw);
  const membership = object(value.latestHouseMembership);
  if (membership.house !== 1 || membership.membershipEndDate != null)
    return null;
  return {
    id: id(value.id),
    name: text(value.nameDisplayAs),
    party: value.latestParty
      ? text(object(value.latestParty).name)
      : "Party not listed",
    constituency: text(membership.membershipFrom),
  };
}
export function parseVotes(raw: unknown): Vote[] {
  return list(object(raw).items)
    .map((item) => {
      const vote = object(object(item).value);
      const date = text(vote.date);
      if (!Number.isFinite(Date.parse(date))) throw new Error("Invalid date");
      if (
        typeof vote.inAffirmativeLobby !== "boolean" ||
        typeof vote.inNegativeLobby !== "boolean" ||
        typeof vote.actedAsTeller !== "boolean"
      )
        throw new Error("Invalid vote");
      const position =
        vote.inAffirmativeLobby && !vote.inNegativeLobby
          ? "Aye"
          : vote.inNegativeLobby && !vote.inAffirmativeLobby
            ? "No"
            : "No clear voting position recorded";
      return {
        id: id(vote.id),
        title: text(vote.title),
        date,
        position: position + (vote.actedAsTeller ? " · Teller" : ""),
      };
    })
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, 10);
}
export function parseInterests(raw: unknown): Interest[] {
  const result: Interest[] = [];
  function visit(items: unknown, category: string, depth = 0) {
    if (depth > 10) throw new Error("Invalid interest hierarchy");
    for (const item of list(items)) {
      const value = object(item);
      if (value.deletedWhen) continue;
      // Render as React text, never executable HTML from an upstream source.
      result.push({ id: id(value.id), category, text: text(value.interest) });
      if (value.childInterests)
        visit(value.childInterests, category, depth + 1);
    }
  }
  for (const category of list(object(raw).value)) {
    const value = object(category);
    visit(value.interests, text(value.name));
  }
  return result;
}
type Fetcher = typeof fetch;
async function request(
  path: string,
  cache: boolean,
  fetcher: Fetcher,
): Promise<unknown> {
  const response = await fetcher(
    `https://members-api.parliament.uk/api/${path}`,
    {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
      ...(cache
        ? { next: { revalidate: 3600 } }
        : { cache: "no-store" as const }),
    },
  );
  if (!response.ok) throw new Error("Parliament unavailable");
  return response.json();
}
export async function searchMembers(query: string, fetcher: Fetcher = fetch) {
  if (lookupError(query)) throw new Error("Invalid search");
  const params = new URLSearchParams({
    Location: query,
    House: "1",
    IsCurrentMember: "true",
    take: "20",
  });
  const data = object(
    await request(`Members/Search?${params}`, false, fetcher),
  );
  const members = list(data.items)
    .map((item) => parseMember(object(item).value))
    .filter((m): m is Member => m !== null);
  return {
    members,
    more: typeof data.totalResults === "number" && data.totalResults > 20,
  };
}
export async function getMemberDetails(
  memberId: number,
  fetcher: Fetcher = fetch,
): Promise<MemberDetails> {
  id(memberId);
  const member = parseMember(
    object(await request(`Members/${memberId}`, true, fetcher)).value,
  );
  if (!member) throw new Error("Not a current MP");
  const [votes, interests] = await Promise.allSettled([
    request(`Members/${memberId}/Voting?house=1&page=1`, true, fetcher).then(
      parseVotes,
    ),
    request(`Members/${memberId}/RegisteredInterests`, true, fetcher).then(
      parseInterests,
    ),
  ]);
  return {
    member,
    votes: votes.status === "fulfilled" ? votes.value : null,
    interests: interests.status === "fulfilled" ? interests.value : null,
    checkedAt: new Date().toISOString(),
  };
}
