import { execFileSync } from "node:child_process";
import { mkdir, stat } from "node:fs/promises";
import { join } from "node:path";

const downloads = join(process.cwd(), "dist", "site", "downloads");
await mkdir(downloads, { recursive: true });

const output = execFileSync(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["pack", "--ignore-scripts", "--pack-destination", downloads],
  { cwd: process.cwd(), encoding: "utf8" }
).trim();

const filename = output.split(/\r?\n/).at(-1);
if (filename !== "screen-reader-smoke-test-0.1.0.tgz") {
  throw new Error(`Unexpected package filename: ${filename ?? "none"}`);
}

const packagePath = join(downloads, filename);
const packageStat = await stat(packagePath);
if (packageStat.size === 0) throw new Error("Download package is empty.");
console.log(`Packed ${packagePath} (${packageStat.size} bytes).`);
