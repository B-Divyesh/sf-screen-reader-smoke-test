import type { TranscriptDiff, TranscriptEvent } from "./types.js";

export function eventToLine(event: TranscriptEvent): string {
  return event.kind === "live"
    ? `live (${event.politeness ?? "polite"}): ${event.text}`
    : `focus: ${event.text}`;
}

export function compareTranscripts(
  expected: TranscriptEvent[],
  received: TranscriptEvent[]
): TranscriptDiff {
  const length = Math.max(expected.length, received.length);
  for (let index = 0; index < length; index += 1) {
    const wanted = expected[index];
    const got = received[index];
    if (!wanted || !got || eventToLine(wanted) !== eventToLine(got)) {
      return {
        matches: false,
        firstDifference: index,
        expected: wanted,
        received: got
      };
    }
  }
  return { matches: true, firstDifference: null };
}
