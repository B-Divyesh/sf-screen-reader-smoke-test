import { compareTranscripts, eventToLine } from "../src/compare.js";
import type { TranscriptEvent } from "../src/types.js";

const sampleExpected = [
  "focus: Email address — textbox — required",
  "focus: Create account — button",
  "live (polite): Account created"
].join("\n");
const sampleReceived = [
  "focus: Email address — textbox — required",
  "focus: Create account — button",
  "live (polite): Check your inbox"
].join("\n");

const expectedInput = document.querySelector<HTMLTextAreaElement>("#expected-input")!;
const receivedInput = document.querySelector<HTMLTextAreaElement>("#received-input")!;
const form = document.querySelector<HTMLFormElement>("#playground-form")!;
const resetButton = document.querySelector<HTMLButtonElement>("#reset-demo")!;
const expectedList = document.querySelector<HTMLOListElement>(".expected-list")!;
const receivedList = document.querySelector<HTMLOListElement>(".received-list")!;
const statusTitle = document.querySelector<HTMLElement>(".status-title")!;
const statusSymbol = document.querySelector<HTMLElement>(".status-symbol")!;
const eventCount = document.querySelector<HTMLElement>(".event-count")!;
const reportAction = document.querySelector<HTMLElement>(".report-action")!;

function parseTranscript(value: string): TranscriptEvent[] {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, index) => {
    const live = line.match(/^live \((polite|assertive)\):\s*(.+)$/);
    if (live) return { kind: "live", politeness: live[1] as "polite" | "assertive", text: live[2]!, step: index + 1 };
    const focus = line.match(/^focus:\s*(.+)$/);
    if (focus) return { kind: "focus", text: focus[1]!, step: index + 1 };
    throw new Error(`Line ${index + 1} must start with focus: or live (polite):.`);
  });
}

function fillList(list: HTMLOListElement, events: TranscriptEvent[], difference: number | null) {
  const rows = events.map((event, index) => {
    const row = document.createElement("li");
    if (difference === index) row.className = "different";
    const code = document.createElement("code");
    code.textContent = eventToLine(event);
    row.append(code);
    return row;
  });
  if (rows.length === 0) {
    const row = document.createElement("li");
    row.className = "empty-state";
    row.textContent = "No events entered.";
    rows.push(row);
  }
  list.replaceChildren(...rows);
}

function compare() {
  try {
    const expected = parseTranscript(expectedInput.value);
    const received = parseTranscript(receivedInput.value);
    const result = compareTranscripts(expected, received);
    fillList(expectedList, expected, result.firstDifference);
    fillList(receivedList, received, result.firstDifference);
    statusTitle.textContent = result.matches ? "No differences found" : "First difference found";
    statusSymbol.textContent = result.matches ? "✓" : "×";
    statusSymbol.classList.toggle("is-match", result.matches);
    eventCount.textContent = `${received.length} / ${expected.length} events`;
    reportAction.textContent = result.matches
      ? "Every event matches the approved transcript."
      : `First difference at event ${(result.firstDifference ?? 0) + 1}.`;
    reportAction.classList.toggle("is-match", result.matches);
  } catch (error) {
    statusTitle.textContent = "Transcript format needs attention";
    statusSymbol.textContent = "!";
    statusSymbol.classList.remove("is-match");
    eventCount.textContent = "Input error";
    reportAction.textContent = error instanceof Error ? error.message : String(error);
    reportAction.classList.remove("is-match");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  compare();
});
resetButton.addEventListener("click", () => {
  expectedInput.value = sampleExpected;
  receivedInput.value = sampleReceived;
  compare();
  expectedInput.focus();
});
compare();

const offlineBanner = document.querySelector<HTMLElement>("#offline-banner");
const updateNetwork = () => { if (offlineBanner) offlineBanner.hidden = navigator.onLine; };
window.addEventListener("online", updateNetwork);
window.addEventListener("offline", updateNetwork);
updateNetwork();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => void navigator.serviceWorker.register("/sw.js"));
}
