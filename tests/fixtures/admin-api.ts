// Local-only protocol fixture. Database authorization is independently tested in SQL.
import { createServer } from "node:http";
import { seedActions } from "../../src/mock-data/actions";
import type { CivicAction } from "../../src/types";
type Row = CivicAction & {
  published_at: string | null;
  revision: number;
  is_demo: boolean;
};
let rows: Row[] = [];
function reset() {
  rows = seedActions.map((row) => ({
    ...row,
    published_at: row.created_at,
    revision: 1,
    is_demo: true,
  }));
}
reset();
createServer(async (req, res) => {
  const url = new URL(req.url!, "http://127.0.0.1:3102");
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  let id = "";
  try {
    id = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString(),
    ).sub;
  } catch {}
  const admin = id === "00000000-0000-0000-0000-000000000001";
  const member = id === "00000000-0000-0000-0000-000000000002";
  const reply = (data: unknown, status = 200) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };
  const body = async () => {
    let text = "";
    for await (const chunk of req) text += chunk;
    return text ? JSON.parse(text) : {};
  };
  if (url.pathname === "/health") return reply({ ok: true });
  if (url.pathname === "/reset") {
    reset();
    return reply({ ok: true });
  }
  if (url.pathname === "/conflict") {
    rows.at(-1)!.revision++;
    return reply({ ok: true });
  }
  if (!admin && !member) return reply({ message: "Not authenticated" }, 401);
  const user = {
    id,
    email: admin ? "admin@example.invalid" : "member@example.invalid",
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: "2026-10-01T00:00:00Z",
  };
  if (url.pathname === "/auth/v1/user") return reply(user);
  if (url.pathname === "/rest/v1/rpc/is_admin") return reply(admin);
  if (url.pathname === "/rest/v1/profiles")
    return reply({
      ...user,
      nickname: admin ? "Admin Test" : "Member Test",
      updated_at: user.created_at,
      terms_accepted_at: user.created_at,
    });
  if (url.pathname === "/rest/v1/action_participation") return reply([]);
  if (url.pathname !== "/rest/v1/actions")
    return reply({ message: "Unknown fixture route" }, 404);
  if (req.method === "POST") {
    if (!admin) return reply({ message: "Denied" }, 403);
    const values = await body();
    rows.push({
      ...values,
      participant_count: 0,
      revision: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      joined: false,
    });
    return reply(null, 201);
  }
  const wantedId = url.searchParams.get("id")?.replace("eq.", "");
  const revision = url.searchParams.get("revision")?.replace("eq.", "");
  if (req.method === "PATCH") {
    if (!admin) return reply({ message: "Denied" }, 403);
    const row = rows.find(
      (row) => row.id === wantedId && row.revision === Number(revision),
    );
    if (!row) return reply([]);
    Object.assign(row, await body(), {
      revision: row.revision + 1,
      updated_at: new Date().toISOString(),
    });
    return reply([{ id: row.id }]);
  }
  let visible = rows.filter((row) => admin || row.published_at !== null);
  if (wantedId) visible = visible.filter((row) => row.id === wantedId);
  if (url.searchParams.get("published_at") === "not.is.null")
    visible = visible.filter((row) => row.published_at !== null);
  return reply(
    req.headers.accept?.includes("vnd.pgrst.object")
      ? visible[0] || null
      : visible,
  );
}).listen(3102, "127.0.0.1");
