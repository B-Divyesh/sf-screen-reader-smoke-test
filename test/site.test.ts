import { chromium, type Browser } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { createServer as createHttpServer } from "node:http";
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { join, normalize } from "node:path";
import { promisify } from "node:util";
import { createServer, type ViteDevServer } from "vite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

let server: ViteDevServer;
let browser: Browser;
let origin: string;

beforeAll(async () => {
  server = await createServer({ root: "site", server: { host: "127.0.0.1", port: 0 } });
  await server.listen();
  const address = server.httpServer?.address();
  if (!address || typeof address === "string") throw new Error("Site server did not bind.");
  origin = `http://127.0.0.1:${address.port}`;
  browser = await chromium.launch({ headless: true });
});

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

describe("documentation site", () => {
  it("has no serious accessibility violations or console errors at desktop and mobile", async () => {
    for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport, reducedMotion: "reduce", serviceWorkers: "block" });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
      page.on("pageerror", (error) => errors.push(error.message));
      for (const path of ["/", "/demo/", "/privacy/", "/terms/"]) {
        await page.goto(`${origin}${path}`, { waitUntil: "domcontentloaded" });
        await page.locator("h1").waitFor();
        expect(await page.locator("h1").count()).toBe(1);
        expect(await page.locator("main").count()).toBe(1);
        expect(await page.locator("html").getAttribute("lang")).toBe("en");
        expect((await page.title()).length).toBeLessThanOrEqual(60);
        expect(await page.locator('meta[name="description"]').getAttribute("content")).toBeTruthy();
        expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBeTruthy();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
        const footerLinks = await page.locator(".site-footer nav a").all();
        expect(footerLinks).toHaveLength(3);
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
        if (path === "/") {
          await page.getByRole("button", { name: "× Divergence" }).click();
          expect(await page.locator(".status-title").textContent()).toBe("Contract diverged");
        }
        const results = await new AxeBuilder({ page }).analyze();
        expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
      }
      expect(errors).toEqual([]);
      await context.close();
    }
  }, 30_000);

  it("@claim:demo-first-difference opens a populated sandbox and compares edited transcripts at desktop and mobile", async () => {
    for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport, reducedMotion: "reduce", serviceWorkers: "block" });
      const page = await context.newPage();
      await page.goto(`${origin}/demo/`, { waitUntil: "domcontentloaded" });
      expect(await page.locator("h1").textContent()).toBe("Compare an announcement transcript.");
      expect(await page.locator(".demo-banner").textContent()).toContain("Demo — sample data, nothing is saved");
      expect(await page.locator(".status-title").textContent()).toBe("Contract diverged");
      expect(await page.locator(".report-action").textContent()).toBe("First difference at event 3.");

      await page.locator("#received-input").fill([
        "focus: Email address — textbox — required",
        "focus: Create account — button",
        "live (polite): Account created"
      ].join("\n"));
      await page.getByRole("button", { name: "Compare transcripts" }).press("Enter");
      expect(await page.locator(".status-title").textContent()).toBe("Contract matched");
      await page.getByRole("button", { name: "Reset demo" }).press("Space");
      expect(await page.locator(".status-title").textContent()).toBe("Contract diverged");
      await page.locator("#received-input").fill("changed without an event prefix");
      await page.getByRole("button", { name: "Compare transcripts" }).click();
      expect(await page.locator(".status-title").textContent()).toBe("Transcript format needs attention");
      expect(await page.locator(".report-action").textContent()).toContain("Line 1 must start with");
      await page.getByRole("button", { name: "Reset demo" }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
      await context.close();
    }
  }, 30_000);

  it("@claim:site-no-tracking keeps the complete demo flow same-origin and out of personal browser storage", async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
    const page = await context.newPage();
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto(`${origin}/demo/`, { waitUntil: "networkidle" });
    await page.locator("#received-input").fill("focus: Email address — textbox — required");
    await page.getByRole("button", { name: "Compare transcripts" }).click();
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
      expect(await page.locator(".status-title").textContent()).toBe("Contract diverged");
      expect(await page.locator("#offline-banner").isHidden()).toBe(false);
      await page.locator("#received-input").fill([
        "focus: Email address — textbox — required",
        "focus: Create account — button",
        "live (polite): Account created"
      ].join("\n"));
      await page.getByRole("button", { name: "Compare transcripts" }).click();
      expect(await page.locator(".status-title").textContent()).toBe("Contract matched");
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
      expect(await page.locator("h1").textContent()).toContain("Catch changed focus");
      expect(errors).toEqual([]);
    } finally {
      await context.close();
      await new Promise<void>((resolve, reject) => outputServer.close((error) => error ? reject(error) : resolve()));
    }
  }, 30_000);
});
