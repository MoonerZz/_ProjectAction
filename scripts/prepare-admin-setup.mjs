import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
export async function buildAdminSetup(email) {
  if (!/^[^\s@']+@[^\s@']+\.[^\s@']+$/.test(email))
    throw new Error("Supply the existing admin account email.");
  const read = (file) =>
    readFile(new URL("../supabase/" + file, import.meta.url), "utf8");
  const stripTransaction = (sql) =>
    sql.replace(/^begin;\r?\n/gm, "").replace(/^commit;\r?\n?/gm, "");
  const migration = stripTransaction(
    await read("migrations/0003_admin_actions.sql"),
  );
  const checks = (await read("tests/admin-actions.sql"))
    .replace(/^begin;\r?\n/gm, "savepoint admin_checks;\n")
    .replace(
      /^rollback;/gm,
      "rollback to savepoint admin_checks; release savepoint admin_checks;",
    );
  const bootstrap = stripTransaction(await read("bootstrap-admin.sql"));
  return (
    "-- One-time setup: schema, security checks and initial admin grant are atomic.\n" +
    "begin;\n" +
    migration +
    "\n" +
    checks +
    "\nselect set_config('civic.bootstrap_email','" +
    email +
    "',true);\n" +
    bootstrap +
    "\ncommit;\n"
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const [email, destination] = process.argv.slice(2);
  if (!destination)
    throw new Error(
      "Usage: node scripts/prepare-admin-setup.mjs EMAIL OUTPUT.sql",
    );
  await writeFile(destination, await buildAdminSetup(email));
  console.log("Saved the one-time admin setup script.");
}
