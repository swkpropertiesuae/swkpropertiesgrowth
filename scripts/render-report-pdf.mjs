// Renders the report to PDF with Playwright (not a project dependency: `npm i -D playwright` or use a machine that has it).
import { pathToFileURL } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
// Playwright is resolved from the project, then from the global npm root.
const req = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = req("playwright")); } catch { ({ chromium } = createRequire(path.join(execSync("npm root -g").toString().trim(), "x.js"))("playwright")); }
const src = path.resolve("reports/growth-lead-engine/index.html"), out = path.resolve("docs/SWK-Growth-Lead-Engine-Report.pdf");
const b = await chromium.launch(), p = await b.newPage();
await p.goto(pathToFileURL(src).href);
await p.evaluate(() => document.fonts.ready);
await p.pdf({ path: out, format: "A4", printBackground: true, displayHeaderFooter: true, preferCSSPageSize: true, headerTemplate: "<span></span>",
  footerTemplate: '<div style="font:8px Arial;color:#6b7488;width:100%;text-align:center;padding-bottom:4px">SWK Properties · Growth &amp; Lead Engine Report · Internal · <span class="pageNumber"></span>/<span class="totalPages"></span></div>' });
await b.close();
console.log("wrote", out);
