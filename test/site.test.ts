import { chromium, type Browser } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { createServer, type ViteDevServer } from "vite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

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
      const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(origin, { waitUntil: "networkidle" });
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
});
