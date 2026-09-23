import { writeFileSync } from "node:fs";
import { seedActions } from "../src/mock-data/actions";
const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;
const array = (values: string[]) =>
  `ARRAY[${values.map(quote).join(",")}]::text[]`;
const rows = seedActions.map(
  (a) =>
    `(${[a.id, a.title, a.summary, a.target, a.demand, a.action_type, a.status, a.starts_at, a.ends_at].map(quote).join(",")},${a.participation_threshold},${a.participant_count},${array(a.safety_notes)},${array(a.alternatives)},${quote(JSON.stringify(a.sources))}::jsonb)`,
);
writeFileSync(
  "supabase/seed.sql",
  `-- FICTIONAL DEMONSTRATION DATA ONLY. Run after the migration.\ninsert into public.actions (id,title,summary,target,demand,action_type,status,starts_at,ends_at,participation_threshold,participant_count,safety_notes,alternatives,sources) values\n${rows.join(",\n")}\non conflict (id) do nothing;\n`,
);
