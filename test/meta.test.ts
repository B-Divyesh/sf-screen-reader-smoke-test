import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("release metadata", () => {
  it("maps every declared claim to exactly one tagged observable test", async () => {
    const claims = JSON.parse(await readFile(".factory/claims.json", "utf8")) as Array<{
      id: string;
      claim: string;
      where: string;
      test: string;
      sandbox: string;
    }>;
    const testFiles = (await readdir("test")).filter((file) => file.endsWith(".test.ts"));
    const testSource = (await Promise.all(testFiles.map((file) => readFile(join("test", file), "utf8")))).join("\n");
    const ids = claims.map((claim) => claim.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const claim of claims) {
      expect(claim.claim.trim()).not.toBe("");
      expect(claim.where.trim()).not.toBe("");
      expect(claim.sandbox.trim()).not.toBe("");
      expect(claim.test).toBe(`npm test -- --testNamePattern @claim:${claim.id}`);
      expect(testSource.match(new RegExp(`@claim:${claim.id}(?![a-z0-9-])`, "g")) ?? []).toHaveLength(1);
    }

    const taggedIds = [...testSource.matchAll(/@claim:([a-z0-9-]+)/g)].map((match) => match[1]);
    expect([...new Set(taggedIds)].sort()).toEqual([...ids].sort());
  });

  it("@claim:mit-license ships the declared MIT license", async () => {
    const packageMetadata = JSON.parse(await readFile("package.json", "utf8")) as { license?: string };
    const license = await readFile("LICENSE", "utf8");
    expect(packageMetadata.license).toBe("MIT");
    expect(license).toContain("Permission is hereby granted, free of charge");
    expect(license).toContain("THE SOFTWARE IS PROVIDED \"AS IS\"");
  });

  it("publishes route-specific social metadata, canonical URLs, and the standard footer", async () => {
    const pages = [
      { file: "index.html", title: "Announce Check — Check browser announcements", canonical: "https://screen-reader-smoke-test.sociobot.in/" },
      { file: "demo/index.html", title: "Demo — Announce Check", canonical: "https://screen-reader-smoke-test.sociobot.in/demo/" },
      { file: "privacy/index.html", title: "Privacy — Announce Check", canonical: "https://screen-reader-smoke-test.sociobot.in/privacy/" },
      { file: "terms/index.html", title: "Terms — Announce Check", canonical: "https://screen-reader-smoke-test.sociobot.in/terms/" },
      { file: "404.html", title: "Page not found — Announce Check", canonical: "https://screen-reader-smoke-test.sociobot.in/404.html" }
    ];
    for (const page of pages) {
      const html = await readFile(join("site", page.file), "utf8");
      expect(html).toContain(`<title>${page.title}</title>`);
      expect(html).toMatch(/<meta name="description" content="[^"]+">/);
      expect(html).toContain(`<link rel="canonical" href="${page.canonical}">`);
      expect(html).toContain(`<meta property="og:title" content="${page.title}">`);
      expect(html).toMatch(/<meta property="og:description" content="[^"]+">/);
      expect(html).toMatch(/<meta property="og:image" content="https:\/\/screen-reader-smoke-test\.sociobot\.in\/og-image\.webp">/);
      expect(html).toContain(`<meta property="og:url" content="${page.canonical}">`);
      expect(html).toContain(`<meta name="twitter:title" content="${page.title}">`);
      expect(html).toMatch(/<meta name="twitter:description" content="[^"]+">/);
      expect(html).toMatch(/<meta name="twitter:image" content="https:\/\/screen-reader-smoke-test\.sociobot\.in\/og-image\.webp">/);
      expect(html).toContain("Version 0.1.0 · Built by Param Factory");
      expect(html).toContain("Source (GitHub, opens external site)");
      expect(html).toMatch(/href="\/demo\/">Demo<\/a>\s*<a href="\/#contract">How it works<\/a>\s*<a href="\/#limits">Limits<\/a>\s*<a href="\/privacy\/"/);
      expect(html).toMatch(/<nav aria-label="Legal">.*href="\/privacy\/".*href="\/terms\/".*href="https:\/\/github\.com\/B-Divyesh\/sf-screen-reader-smoke-test"/s);
    }
  });

  it("publishes every real route and a deployment-level 404 response", async () => {
    const sitemap = await readFile("site/public/sitemap.xml", "utf8");
    for (const route of ["/", "/demo/", "/privacy/", "/terms/"]) {
      expect(sitemap).toContain(`<loc>https://screen-reader-smoke-test.sociobot.in${route}</loc>`);
    }
    const deployment = JSON.parse(await readFile("site/public/staticwebapp.config.json", "utf8")) as {
      routes: Array<{ route: string; rewrite?: string }>;
      responseOverrides: Record<string, { rewrite: string; statusCode: number }>;
    };
    expect(deployment.routes).toContainEqual({ route: "/demo", rewrite: "/demo/index.html" });
    expect(deployment.responseOverrides["404"]).toEqual({ rewrite: "/404.html", statusCode: 404 });
    expect(await readFile("site/404.html", "utf8")).toContain('<h1 tabindex="-1">This page does not exist.</h1>');
  });
});
