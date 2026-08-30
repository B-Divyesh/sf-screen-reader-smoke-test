import { chromium, type Browser } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { createServer as createHttpServer } from "node:http";
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { join, normalize } from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";

const execFileAsync = promisify(execFile);

let browser: Browser;
const origin = inject("siteOrigin");

beforeAll(async () => {
  browser = await chromium.launch({ headless: true });
});

afterAll(async () => {
  await browser?.close();
});

describe("documentation site", () => {
  it("has no serious accessibility violations or console errors at desktop and mobile", async () => {
    const routes = [
      { path: "/", title: "Announce Check — Check browser announcements", canonical: "https://screen-reader-smoke-test.sociobot.in/" },
      { path: "/demo/", title: "Demo — Announce Check", canonical: "https://screen-reader-smoke-test.sociobot.in/demo/" },
      { path: "/privacy/", title: "Privacy — Announce Check", canonical: "https://screen-reader-smoke-test.sociobot.in/privacy/" },
      { path: "/terms/", title: "Terms — Announce Check", canonical: "https://screen-reader-smoke-test.sociobot.in/terms/" }
    ];
    for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport, reducedMotion: "reduce", serviceWorkers: "block" });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
      page.on("pageerror", (error) => errors.push(error.message));
      for (const route of routes) {
        await page.goto(`${origin}${route.path}`, { waitUntil: "domcontentloaded" });
        await page.locator("h1").waitFor();
        expect(await page.locator("h1").count()).toBe(1);
        expect(await page.locator("main").count()).toBe(1);
        expect(await page.locator("html").getAttribute("lang")).toBe("en");
        expect(await page.title()).toBe(route.title);
        expect(route.title.length).toBeLessThanOrEqual(60);
        expect(await page.locator('meta[name="description"]').getAttribute("content")).toBeTruthy();
        expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(route.canonical);
        expect(await page.locator('meta[property="og:title"]').getAttribute("content")).toBe(route.title);
        expect(await page.locator('meta[property="og:url"]').getAttribute("content")).toBe(route.canonical);
        expect(await page.locator('meta[name="twitter:title"]').getAttribute("content")).toBe(route.title);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
        const headerLinks = await page.locator(".site-header nav a").evaluateAll((links) => links.map((link) => ({
          name: link.textContent?.trim(), href: (link as HTMLAnchorElement).getAttribute("href")
        })));
        expect(headerLinks).toEqual([
          { name: "Demo", href: "/demo/" },
          { name: "How it works", href: "/#contract" },
          { name: "Limits", href: "/#limits" },
          { name: "Privacy", href: "/privacy/" }
        ]);
        const footerLinkLocator = page.locator(".site-footer nav a");
        const footerLinks = await footerLinkLocator.all();
        expect(await footerLinkLocator.evaluateAll((links) => links.map((link) => ({
          name: link.textContent?.trim(), href: (link as HTMLAnchorElement).getAttribute("href")
        })))).toEqual([
          { name: "Privacy", href: "/privacy/" },
          { name: "Terms", href: "/terms/" },
          { name: "Source (GitHub, opens external site)", href: "https://github.com/B-Divyesh/sf-screen-reader-smoke-test" }
        ]);
        expect(await page.locator(".site-footer").textContent()).toContain("Version 0.1.0 · Built by Param Factory");
        expect(await page.getByRole("link", { name: "Source (GitHub, opens external site)" }).count()).toBe(1);
        for (const link of footerLinks) {
          const box = await link.boundingBox();
          expect(box?.width).toBeGreaterThanOrEqual(44);
          expect(box?.height).toBeGreaterThanOrEqual(44);
        }
        const undersizedTargets = await page.locator("a, button").evaluateAll((elements) => elements.flatMap((element) => {
          const box = element.getBoundingClientRect();
          const visible = box.width > 0 && box.height > 0 && getComputedStyle(element).visibility !== "hidden";
          return visible && (box.width < 44 || box.height < 44)
            ? [{ text: (element.textContent ?? "").trim(), width: box.width, height: box.height }]
            : [];
        }));
        expect(undersizedTargets).toEqual([]);
        await page.keyboard.press("Tab");
        expect(await page.evaluate(() => document.activeElement?.classList.contains("skip-link"))).toBe(true);
        await page.keyboard.press("Enter");
        expect(await page.evaluate(() => location.hash)).toBe("#main");
        expect(await page.locator("main").evaluate((main) => document.activeElement === main)).toBe(true);
        if (route.path === "/") {
          await page.getByRole("button", { name: "Show first difference" }).click();
          expect(await page.locator(".status-title").textContent()).toBe("First difference found");
        }
        const results = await new AxeBuilder({ page }).analyze();
        expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
      }
      expect(errors).toEqual([]);
      await context.close();
    }
  }, 30_000);

  it("@claim:demo-first-difference opens a populated sandbox and compares edited event lists at desktop and mobile", async () => {
    for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport, reducedMotion: "reduce", serviceWorkers: "block" });
      const page = await context.newPage();
      await page.goto(`${origin}/?demo=1`, { waitUntil: "domcontentloaded" });
      await page.waitForURL(`${origin}/demo/?demo=1`);
      expect(await page.locator("h1").textContent()).toBe("Compare two sample event lists.");
      expect(await page.locator(".demo-banner").textContent()).toContain("Demo — sample data, nothing is saved");
      expect(await page.locator(".status-title").textContent()).toBe("First difference found");
      expect(await page.locator(".report-action").textContent()).toBe("First difference at event 3.");
      expect(await page.locator(".expected-difference").textContent()).toBe("Account created");
      expect(await page.locator(".received-difference").textContent()).toBe("Check your inbox");
      const resultBox = await page.locator(".playground-result").boundingBox();
      expect(resultBox).not.toBeNull();
      expect(resultBox!.y).toBeLessThan(viewport.height);
      expect(resultBox!.y + resultBox!.height).toBeGreaterThan(0);
      for (const selector of [".report-action", ".expected-difference", ".received-difference"]) {
        const box = await page.locator(selector).boundingBox();
        expect(box).not.toBeNull();
        expect(box!.y).toBeGreaterThanOrEqual(0);
        expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
      }

      await page.locator("#received-input").fill([
        "focus: Email address — textbox — required",
        "focus: Create account — button",
        "live (polite): Account created"
      ].join("\n"));
      await page.getByRole("button", { name: "Compare event lists" }).press("Enter");
      expect(await page.locator(".status-title").textContent()).toBe("No differences found");
      await page.getByRole("button", { name: "Reset demo" }).press("Space");
      expect(await page.locator(".status-title").textContent()).toBe("First difference found");
      expect(await page.locator("#expected-input").inputValue()).toContain("live (polite): Account created");
      expect(await page.locator("#received-input").inputValue()).toContain("live (polite): Check your inbox");
      expect(await page.locator("#expected-input").evaluate((input) => document.activeElement === input)).toBe(true);
      const resetInputBox = await page.locator("#expected-input").boundingBox();
      const demoBannerBox = await page.locator(".demo-banner").boundingBox();
      expect(resetInputBox).not.toBeNull();
      expect(demoBannerBox).not.toBeNull();
      expect(resetInputBox!.y).toBeGreaterThanOrEqual(demoBannerBox!.y + demoBannerBox!.height);
      expect(resetInputBox!.y + resetInputBox!.height).toBeLessThanOrEqual(viewport.height);
      await page.locator("#received-input").fill("changed without an event prefix");
      await page.getByRole("button", { name: "Compare event lists" }).click();
      expect(await page.locator(".status-title").textContent()).toBe("Event list format needs attention");
      expect(await page.locator(".report-action").textContent()).toContain("Line 1 must start with");
      await page.getByRole("button", { name: "Reset demo" }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
      await context.close();
    }
  }, 30_000);

  it("keeps the first action and tested privacy, offline, and price facts inside the first screen", async () => {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 800 }, { width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport, reducedMotion: "reduce", serviceWorkers: "block" });
      const page = await context.newPage();
      await page.goto(`${origin}/`, { waitUntil: "domcontentloaded" });
      expect(await page.getByRole("link", { name: "Try it with sample data" }).isVisible()).toBe(true);
      expect(await page.locator(".hero-facts li").allTextContents()).toEqual([
        "Filled values are redacted.",
        "Works offline after your first visit.",
        "Free under the MIT License."
      ]);
      for (const selector of [".hero-primary", ".hero-action-row p", ".hero-facts"]) {
        const box = await page.locator(selector).boundingBox();
        expect(box).not.toBeNull();
        expect(box!.y).toBeGreaterThanOrEqual(0);
        expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
      }
      await context.close();
    }
  });

  it("keeps the skip link and header at the start of a fresh keyboard path on desktop and 390px", async () => {
    for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport, serviceWorkers: "block" });
      const page = await context.newPage();
      await page.goto(`${origin}/`, { waitUntil: "domcontentloaded" });

      expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
      await page.keyboard.press("Tab");
      expect(await page.locator(".skip-link").evaluate((link) => document.activeElement === link)).toBe(true);
      const skipBox = await page.locator(".skip-link").boundingBox();
      expect(skipBox?.y).toBeGreaterThanOrEqual(0);
      expect(skipBox!.y + skipBox!.height).toBeLessThanOrEqual(viewport.height);

      await page.keyboard.press("Tab");
      expect(await page.getByRole("link", { name: "Announce Check home" }).evaluate((link) => document.activeElement === link)).toBe(true);
      await page.keyboard.press("Tab");
      expect(await page.getByRole("link", { name: "Demo" }).evaluate((link) => document.activeElement === link)).toBe(true);
      await context.close();
    }
  });

  it("keeps Reset demo's focused input visible immediately at 390px with normal motion", async () => {
    const viewport = { width: 390, height: 844 };
    const context = await browser.newContext({ viewport, serviceWorkers: "block" });
    const page = await context.newPage();
    await page.goto(`${origin}/demo/`, { waitUntil: "domcontentloaded" });
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(false);

    await page.locator("#received-input").fill("not an event");
    await page.getByRole("button", { name: "Compare event lists" }).click();
    expect(await page.locator(".status-title").textContent()).toBe("Event list format needs attention");
    await page.getByRole("button", { name: "Reset demo" }).focus();
    await page.keyboard.press("Space");

    expect(await page.locator("#expected-input").evaluate((input) => document.activeElement === input)).toBe(true);
    const resetInputBox = await page.locator("#expected-input").boundingBox();
    const demoBannerBox = await page.locator(".demo-banner").boundingBox();
    expect(resetInputBox).not.toBeNull();
    expect(demoBannerBox).not.toBeNull();
    expect(resetInputBox!.y).toBeGreaterThanOrEqual(demoBannerBox!.y + demoBannerBox!.height);
    expect(resetInputBox!.y + resetInputBox!.height).toBeLessThanOrEqual(viewport.height);
    await context.close();
  });

  it("redirects the one-click ?demo=1 entry point into the isolated sample", async () => {
    const context = await browser.newContext({ serviceWorkers: "block" });
    const page = await context.newPage();
    await page.goto(`${origin}/?demo=1`, { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/demo\/\?demo=1$/);
    expect(await page.locator(".demo-banner").textContent()).toContain("Demo — sample data, nothing is saved");
    expect(await page.getByRole("button", { name: "Reset demo" }).count()).toBe(1);
    await context.close();
  });

  it("@claim:site-no-tracking keeps the complete demo flow same-origin and out of personal browser storage", async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
    const page = await context.newPage();
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto(`${origin}/?demo=1`, { waitUntil: "networkidle" });
    await page.waitForURL(`${origin}/demo/?demo=1`);
    await page.locator("#received-input").fill("focus: Email address — textbox — required");
    await page.getByRole("button", { name: "Compare event lists" }).click();
    await page.getByRole("button", { name: "Reset demo" }).click();

    expect(requests.length).toBeGreaterThan(0);
    expect(requests.every((url) => new URL(url).origin === origin)).toBe(true);
    expect(await context.cookies()).toEqual([]);
    expect(await page.evaluate(async () => ({
      local: localStorage.length,
      session: sessionStorage.length,
      databases: "databases" in indexedDB ? (await indexedDB.databases()).length : 0
    }))).toEqual({ local: 0, session: 0, databases: 0 });
    await context.close();
  });

  it("keeps the privacy repository link at least 44 CSS pixels tall", async () => {
    for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport, serviceWorkers: "block" });
      const page = await context.newPage();
      await page.goto(`${origin}/privacy/`, { waitUntil: "domcontentloaded" });
      const repositoryLink = page.getByRole("link", { name: "public source repository" });
      const box = await repositoryLink.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
      await context.close();
    }
  });

  it("@claim:offline-demo precaches the built demo for a cold-cache offline reload and versions every worker shell", async () => {
    await execFileAsync("npm", ["run", "build:site"]);
    const builtIndex = await readFile("dist/site/index.html", "utf8");
    const worker = await readFile("dist/site/sw.js", "utf8");
    const staticConfig = JSON.parse(await readFile("site/public/staticwebapp.config.json", "utf8")) as {
      globalHeaders: Record<string, string>;
      routes: Array<{ route: string; rewrite?: string }>;
      responseOverrides: Record<string, { rewrite: string; statusCode: number }>;
    };
    const assets = [...builtIndex.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map((match) => match[1]!);
    const initialCache = worker.match(/const CACHE = "([^"]+)";/)?.[1];

    expect(worker).toMatch(/const CACHE = "announce-check-docs-[a-f0-9]{12}";/);
    expect(worker).not.toContain("announce-check-docs-v1");
    for (const asset of assets) expect(worker).toContain(JSON.stringify(asset));
    expect(worker).toContain("networkFirstDocument");
    expect(worker).toContain("cacheFirstAsset");
    expect(initialCache).toBeTruthy();
    expect(staticConfig.routes).toContainEqual({ route: "/demo", rewrite: "/demo/index.html" });
    expect(staticConfig.responseOverrides["404"]).toEqual({ rewrite: "/404.html", statusCode: 404 });
    expect(staticConfig.globalHeaders).toMatchObject({
      "Content-Security-Policy": expect.stringContaining("default-src 'self'"),
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Content-Type-Options": "nosniff",
      "Strict-Transport-Security": expect.stringContaining("max-age=")
    });

    const files = join(process.cwd(), "dist", "site");
    let servedWorker = worker;
    const outputServer = createHttpServer(async (request, response) => {
      const requestPath = new URL(request.url ?? "/", "http://localhost").pathname;
      const relativePath = requestPath === "/" ? "index.html" : requestPath.endsWith("/") ? `${requestPath.slice(1)}index.html` : requestPath.slice(1);
      const path = join(files, normalize(relativePath));
      if (!path.startsWith(files)) {
        response.writeHead(400).end();
        return;
      }
      try {
        const body = relativePath === "sw.js" ? Buffer.from(servedWorker) : await readFile(path);
        const type = path.endsWith(".js") ? "text/javascript" : path.endsWith(".css") ? "text/css" : path.endsWith(".webp") ? "image/webp" : "text/html; charset=utf-8";
        response.writeHead(200, { "content-type": type, "cache-control": "no-cache" }).end(body);
      } catch {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not found");
      }
    });
    await new Promise<void>((resolve) => outputServer.listen(0, "127.0.0.1", resolve));
    const address = outputServer.address();
    if (!address || typeof address === "string") throw new Error("Built-site server did not bind.");
    const builtOrigin = `http://127.0.0.1:${address.port}`;
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.goto(builtOrigin, { waitUntil: "domcontentloaded", timeout: 10_000 });
      await page.locator(".status-title").waitFor();
      await page.waitForLoadState("load", { timeout: 10_000 });
      await page.waitForFunction(() => navigator.serviceWorker.ready.then(() => true), undefined, { timeout: 10_000 });
      await page.reload({ waitUntil: "domcontentloaded", timeout: 10_000 });
      await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, { timeout: 10_000 });
      await page.goto(`${builtOrigin}/demo/`, { waitUntil: "domcontentloaded", timeout: 10_000 });
      await page.locator(".status-title").waitFor();
      const cdp = await context.newCDPSession(page);
      await cdp.send("Network.clearBrowserCache");
      await context.setOffline(true);
      await page.reload({ waitUntil: "domcontentloaded", timeout: 10_000 });
      expect(await page.locator(".status-title").textContent()).toBe("First difference found");
      expect(await page.locator("#offline-banner").isHidden()).toBe(false);
      await page.locator("#received-input").fill([
        "focus: Email address — textbox — required",
        "focus: Create account — button",
        "live (polite): Account created"
      ].join("\n"));
      await page.getByRole("button", { name: "Compare event lists" }).click();
      expect(await page.locator(".status-title").textContent()).toBe("No differences found");
      await context.setOffline(false);

      // Reproduce the verifier's stale-document sentinel, then deliver a new
      // worker. The new content-addressed cache must replace it on activation.
      await page.evaluate(async (cacheName) => {
        const cache = await caches.open(cacheName);
        await cache.put("/", new Response("<!doctype html><title>stale sentinel</title>"));
      }, initialCache!);
      const updatedCache = "announce-check-docs-update-regression";
      servedWorker = worker.replace(`const CACHE = "${initialCache}";`, `const CACHE = "${updatedCache}";`);
      await page.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        await registration?.update();
      });
      await page.waitForFunction(async ({ oldCache, newCache }) => {
        const keys = await caches.keys();
        return keys.includes(newCache) && !keys.includes(oldCache);
      }, { oldCache: initialCache!, newCache: updatedCache }, { timeout: 10_000 });
      await page.goto(builtOrigin, { waitUntil: "domcontentloaded", timeout: 10_000 });
      expect(await page.locator("h1").textContent()).toContain("Catch changed keyboard focus");
      expect(errors).toEqual([]);
    } finally {
      await context.close();
      await new Promise<void>((resolve, reject) => outputServer.close((error) => error ? reject(error) : resolve()));
    }
  }, 30_000);
});
