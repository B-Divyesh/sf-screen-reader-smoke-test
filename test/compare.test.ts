import { describe, expect, it } from "vitest";
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
});
