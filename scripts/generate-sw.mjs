import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const siteDirectory = join(process.cwd(), "dist", "site");
const sourcePath = join(process.cwd(), "site", "public", "sw.js");
const outputPath = join(siteDirectory, "sw.js");
const staticShell = ["/", "/demo/", "/privacy/", "/terms/", "/404.html", "/announce-field.webp", "/og-image.webp", "/apple-touch-icon.png", "/mark.svg"];

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.isFile() && entry.name.endsWith(".html") ? [path] : [];
  }));
  return nested.flat();
}

const files = await htmlFiles(siteDirectory);
const assetPaths = new Set();
for (const path of files) {
  const html = await readFile(path, "utf8");
  for (const match of html.matchAll(/(?:src|href)=["'](\/assets\/[^"']+)["']/g)) assetPaths.add(match[1]);
}

const shell = [...new Set([...staticShell, ...assetPaths])];
const template = await readFile(sourcePath, "utf8");
const version = createHash("sha256")
  .update(template)
  .update(JSON.stringify(shell))
  .digest("hex")
  .slice(0, 12);
const worker = template
  .replace('const CACHE = "announce-check-docs-dev";', `const CACHE = "announce-check-docs-${version}";`)
  .replace(/const SHELL = \[[\s\S]*?\];/, `const SHELL = ${JSON.stringify(shell)};`);

if (worker === template) throw new Error("Service worker template markers were not replaced.");
await writeFile(outputPath, worker, "utf8");
console.log(`Generated ${relative(process.cwd(), outputPath)} with ${shell.length} precached entries.`);
