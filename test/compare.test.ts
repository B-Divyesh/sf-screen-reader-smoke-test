import { describe, expect, it } from "vitest";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import { compareTranscripts, eventToLine } from "../src/compare.js";
import { renderReport } from "../src/report.js";
import type { CheckResult, TranscriptEvent } from "../src/types.js";

const events: TranscriptEvent[] = [
  { kind: "focus", text: "Email address — textbox — required", step: 1 },
  { kind: "live", text: "Account created", politeness: "polite", step: 2 }
];

describe("announcement contract comparison", () => {
  it("matches equivalent semantic lines even when step metadata changes", () => {
    const received = events.map((event) => ({ ...event, step: event.step + 1 }));
    expect(compareTranscripts(events, received)).toEqual({ matches: true, firstDifference: null });
    expect(eventToLine(events[1]!)).toBe("live (polite): Account created");
  });

  it("returns the first divergence and handles missing events", () => {
    const diff = compareTranscripts(events, [events[0]!]);
    expect(diff.matches).toBe(false);
    expect(diff.firstDifference).toBe(1);
    expect(diff.expected).toEqual(events[1]);
    expect(diff.received).toBeUndefined();
  });

  it("escapes report content and presents the first difference", () => {
    const result: CheckResult = {
      name: '<script>alert("x")</script>',
      url: "http://127.0.0.1/test",
      matches: false,
      updated: false,
      expected: events,
      received: [{ ...events[0]!, text: "Different" }],
      diff: compareTranscripts(events, [{ ...events[0]!, text: "Different" }]),
      durationMs: 20,
      notice: "Not screen-reader speech."
    };
    const report = renderReport(result);
    expect(report).not.toContain('<script>alert("x")</script>');
    expect(report).toContain("First difference");
    expect(report.match(/<h1/g)).toHaveLength(1);
  });

  it("has no serious or critical Axe findings in a generated mismatch report at desktop and mobile", async () => {
    const result: CheckResult = {
      name: "Image button contract",
      url: "http://127.0.0.1/signup",
      matches: false,
      updated: false,
      expected: [{ kind: "focus", text: "Create account — button", step: 1 }],
      received: [{ kind: "focus", text: "Register now — button", step: 1 }],
      diff: {
        matches: false,
        firstDifference: 0,
        expected: { kind: "focus", text: "Create account — button", step: 1 },
        received: { kind: "focus", text: "Register now — button", step: 1 }
      },
      durationMs: 20,
      notice: "Not screen-reader speech."
    };
    const browser = await chromium.launch({ headless: true });
    try {
      for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
        const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
        const page = await context.newPage();
        await page.setContent(renderReport(result), { waitUntil: "load" });
        expect(await page.locator(".marker").count()).toBe(2);
        const findings = await new AxeBuilder({ page }).analyze();
        expect(findings.violations.filter((finding) => ["serious", "critical"].includes(finding.impact ?? ""))).toEqual([]);
        await context.close();
      }
    } finally {
      await browser.close();
    }
  }, 30_000);
});
