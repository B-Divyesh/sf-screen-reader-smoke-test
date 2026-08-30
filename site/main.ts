const expected = [
  "focus: Email address — textbox — required",
  "focus: Create account — button",
  "live (polite): Account created"
];

// The catalog and the first-screen action use this short, shareable demo URL.
// The canonical demo document keeps its own isolated, in-memory sample state.
if (new URLSearchParams(window.location.search).get("demo") === "1") {
  window.location.replace("/demo/?demo=1");
}

const receivedByMode: Record<string, string[]> = {
  match: expected,
  diverge: [
    "focus: Email address — textbox — required",
    "focus: Create account — button",
    "live (polite): Check your inbox"
  ],
  empty: [],
  error: []
};

const listMarkup = (items: string[], difference: number | null, emptyMessage: string) => {
  if (items.length === 0) return `<li class="empty-state"><strong>${emptyMessage}</strong><span>Choose another state to inspect an event list.</span></li>`;
  return items.map((item, index) => `<li${difference === index ? ' class="different"' : ""}><code>${item}</code></li>`).join("");
};

const buttons = [...document.querySelectorAll<HTMLButtonElement>("[data-demo]")];
const expectedList = document.querySelector<HTMLOListElement>(".expected-list")!;
const receivedList = document.querySelector<HTMLOListElement>(".received-list")!;
const statusTitle = document.querySelector<HTMLElement>(".status-title")!;
const statusSymbol = document.querySelector<HTMLElement>(".status-symbol")!;
const eventCount = document.querySelector<HTMLElement>(".event-count")!;
const reportAction = document.querySelector<HTMLElement>(".report-action")!;

function showDemo(mode: string) {
  const received = receivedByMode[mode] ?? expected;
  const difference = mode === "diverge" ? 2 : null;
  const isError = mode === "error";
  const isEmpty = mode === "empty";
  const isMatch = mode === "match";
  expectedList.innerHTML = listMarkup(isError ? [] : expected, difference, isError ? "Expected event list unavailable" : "No expected events");
  receivedList.innerHTML = listMarkup(received, difference, isError ? "Chromium could not start" : "No accessibility events captured");
  statusTitle.textContent = isMatch ? "No differences found" : isError ? "Check could not run" : isEmpty ? "No events captured" : "First difference found";
  statusSymbol.textContent = isMatch ? "✓" : isEmpty ? "○" : "×";
  statusSymbol.classList.toggle("is-match", isMatch);
  eventCount.textContent = isError ? "Run error" : `${received.length} / ${expected.length} events`;
  reportAction.hidden = isMatch;
  reportAction.textContent = isError
    ? "Install Chromium with: npx playwright install chromium"
    : isEmpty
      ? "Move focus or update a role=status / aria-live region in the scripted flow."
    : "First difference at event 3: review the status message or update the approved event list.";
  buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.demo === mode)));
}

buttons.forEach((button) => button.addEventListener("click", () => showDemo(button.dataset.demo ?? "match")));
showDemo("match");

const copyButton = document.querySelector<HTMLButtonElement>("[data-copy]");
const copyStatus = document.querySelector<HTMLElement>("#copy-status");
copyButton?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(copyButton.dataset.copy ?? "");
    copyButton.querySelector("span")!.textContent = "Copied";
    if (copyStatus) copyStatus.textContent = "Install command copied.";
  } catch {
    if (copyStatus) copyStatus.textContent = "Select the command and copy it manually.";
  }
});

const offlineBanner = document.querySelector<HTMLElement>("#offline-banner");
const updateNetwork = () => { if (offlineBanner) offlineBanner.hidden = navigator.onLine; };
window.addEventListener("online", updateNetwork);
window.addEventListener("offline", updateNetwork);
updateNetwork();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => void navigator.serviceWorker.register("/sw.js"));
}
