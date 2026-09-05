import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

function auditRows(markdown: string, heading: string): Array<{ words: number; copy: string }> {
  const start = markdown.indexOf(`## ${heading}`);
  if (start < 0) throw new Error(`Missing copy-audit section: ${heading}`);
  const rest = markdown.slice(start + heading.length + 3);
  const end = rest.search(/^## /m);
  const section = end < 0 ? rest : rest.slice(0, end);
  return [...section.matchAll(/^\|\s*(\d+)\s*\|\s*(.*?)\s*\|$/gm)].map((match) => ({
    words: Number(match[1]),
    copy: match[2]!.replaceAll("&lt;", "<").replaceAll("&gt;", ">").trim()
  }));
}

function countWords(copy: string): number {
  return copy
    .replaceAll("`", "")
    .split(/\s+/)
    .filter((word) => word.length > 0 && word !== "/" && word !== "·")
    .length;
}

function readmeSentences(markdown: string): string[] {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, "");
  const paragraphs: string[] = [];
  let lines: string[] = [];
  const flush = () => {
    if (lines.length > 0) paragraphs.push(lines.join(" "));
    lines = [];
  };

  for (const rawLine of withoutCode.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || /^[-*]\s/.test(line)) {
      flush();
      continue;
    }
    lines.push(line.replace(/^>\s?/, ""));
  }
  flush();

  return paragraphs.flatMap((paragraph) => paragraph
    .replace(/<((?:https?:\/\/)[^>]+)>/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .split(/(?<=[.!?])\s+(?=[A-Z-])/)
    .map((sentence) => sentence.trim().replace(/:$/, "."))
    .filter(Boolean));
}

describe("plain-language copy audit", () => {
  it("counts every audited sentence with the documented tokenizer", async () => {
    const audit = await readFile(".factory/copy-audit.md", "utf8");
    const rows = [
      ...auditRows(audit, "Landing-page prose and dynamic messages"),
      ...auditRows(audit, "README prose")
    ];
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(countWords(row.copy), row.copy).toBe(row.words);
    expect(rows.every((row) => row.words <= 22)).toBe(true);
  });

  it("keeps the README sentence inventory synchronized with the published prose", async () => {
    const audit = await readFile(".factory/copy-audit.md", "utf8");
    const readme = await readFile("README.md", "utf8");
    expect(auditRows(audit, "README prose").map((row) => row.copy)).toEqual(readmeSentences(readme));
  });

  it("keeps landing entries anchored to rendered copy and records the corrected boundaries", async () => {
    const audit = await readFile(".factory/copy-audit.md", "utf8");
    const landingHtml = await readFile("site/index.html", "utf8");
    const landingScript = await readFile("site/main.ts", "utf8");
    const readmeRows = auditRows(audit, "README prose").map((row) => row.copy);
    const landingRows = auditRows(audit, "Landing-page prose and dynamic messages").map((row) => row.copy);
    const landingSource = `${landingHtml.replace(/<[^>]+>/g, " ")} ${landingHtml} ${landingScript}`.replace(/\s+/g, " ");
    for (const row of landingRows) {
      expect(landingSource, row).toContain(row.replace(/[.!?]$/, ""));
    }
    expect(readmeRows).toContain("Open https://screen-reader-smoke-test.sociobot.in/demo/.");
    expect(landingRows).toContain("Announce Check compares one checked-in browser flow.");
    expect(landingRows).toContain("Version 0.1.0 · Built by Param Factory.");
    expect(landingRows).not.toContain("Announce Check compares one checked-in browser flow. Version 0.1.0 · Built by Param Factory.");
  });
});
