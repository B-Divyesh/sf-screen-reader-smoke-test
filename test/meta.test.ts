import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("release metadata", () => {
  it("@claim:mit-license ships the declared MIT license", async () => {
    const packageMetadata = JSON.parse(await readFile("package.json", "utf8")) as { license?: string };
    const license = await readFile("LICENSE", "utf8");
    expect(packageMetadata.license).toBe("MIT");
    expect(license).toContain("Permission is hereby granted, free of charge");
    expect(license).toContain("THE SOFTWARE IS PROVIDED \"AS IS\"");
  });

  it("publishes route-specific social metadata, canonical URLs, and the standard footer", async () => {
    const pages = ["index.html", "demo/index.html", "privacy/index.html", "terms/index.html", "404.html"];
    for (const page of pages) {
      const html = await readFile(join("site", page), "utf8");
      expect(html).toMatch(/<meta name="description" content="[^"]+">/);
      expect(html).toMatch(/<link rel="canonical" href="https:\/\/screen-reader-smoke-test\.sociobot\.in\/[^"]*">/);
      expect(html).toMatch(/<meta property="og:title" content="[^"]+">/);
      expect(html).toMatch(/<meta property="og:description" content="[^"]+">/);
      expect(html).toMatch(/<meta property="og:image" content="https:\/\/screen-reader-smoke-test\.sociobot\.in\/og-image\.webp">/);
      expect(html).toMatch(/<meta name="twitter:title" content="[^"]+">/);
      expect(html).toMatch(/<meta name="twitter:description" content="[^"]+">/);
      expect(html).toMatch(/<meta name="twitter:image" content="https:\/\/screen-reader-smoke-test\.sociobot\.in\/og-image\.webp">/);
      expect(html).toContain("Version 0.1.0 · Built by Param Factory");
      expect(html).toContain("Source (GitHub, opens external site)");
      expect(html).toMatch(/href="\/demo\/">Demo<\/a>\s*<a href="\/#contract">How it works<\/a>\s*<a href="\/#limits">Limits<\/a>\s*<a href="\/privacy\/"/);
    }
  });
});
