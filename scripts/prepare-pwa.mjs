import { readFileSync, writeFileSync } from "node:fs";
import { brand } from "../src/lib/brand.ts";
const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const template = readFileSync(
  new URL("./offline.template.html", import.meta.url),
  "utf8",
);
writeFileSync(
  new URL("../public/offline.html", import.meta.url),
  template
    .replaceAll("{{name}}", escapeHtml(brand.name))
    .replaceAll("{{theme}}", brand.theme)
    .replaceAll("{{background}}", brand.background),
);
