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
      await page.goto(origin, { waitUntil: "domcontentloaded" });
      await page.locator("h1").waitFor();
      expect(await page.locator("h1").count()).toBe(1);
      expect(await page.locator("main").count()).toBe(1);
      expect(await page.locator("html").getAttribute("lang")).toBe("en");
      const footerLinks = await page.locator(".site-footer nav a").all();
      expect(footerLinks).toHaveLength(3);
      for (const link of footerLinks) {
        const box = await link.boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(44);
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }
      await page.getByRole("button", { name: "× Divergence" }).click();
      expect(await page.locator(".status-title").textContent()).toBe("Contract diverged");
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
      expect(errors).toEqual([]);
      await context.close();
    }
  }, 30_000);

  it("precaches the built assets for a cold-cache offline reload and versions every worker shell", async () => {
    await execFileAsync("npm", ["run", "build:site"]);
    const builtIndex = await readFile("dist/site/index.html", "utf8");
    const worker = await readFile("dist/site/sw.js", "utf8");
    const staticConfig = JSON.parse(await readFile("site/public/staticwebapp.config.json", "utf8")) as {
      globalHeaders: Record<string, string>;
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
      const cdp = await context.newCDPSession(page);
      await cdp.send("Network.clearBrowserCache");
      await context.setOffline(true);
      await page.reload({ waitUntil: "domcontentloaded", timeout: 10_000 });
      expect(await page.locator(".status-title").textContent()).toBe("Contract matched");
      expect(await page.locator("#offline-banner").isHidden()).toBe(false);
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
      await page.reload({ waitUntil: "domcontentloaded", timeout: 10_000 });
      expect(await page.locator("h1").textContent()).toContain("Hear the break");
      expect(errors).toEqual([]);
    } finally {
      await context.close();
      await new Promise<void>((resolve, reject) => outputServer.close((error) => error ? reject(error) : resolve()));
    }
  }, 30_000);
});
