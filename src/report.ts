import { eventToLine } from "./compare.js";
import type { CheckResult, TranscriptEvent } from "./types.js";

const escapeHtml = (value: string | number) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

function rows(events: TranscriptEvent[], firstDifference: number | null): string {
  if (events.length === 0) {
    return '<li class="empty"><strong>No events captured.</strong><span>Check that the flow moves focus or updates an ARIA live region.</span></li>';
  }
  return events
    .map((event, index) => {
      const different = firstDifference === index;
      return `<li${different ? ' class="different"' : ""}><span class="index">${String(index + 1).padStart(2, "0")}</span><code>${escapeHtml(eventToLine(event))}</code><span class="step">step ${event.step}</span>${different ? '<strong class="marker">First difference</strong>' : ""}</li>`;
    })
    .join("");
}

export function renderReport(result: CheckResult): string {
  const title = result.matches ? "Contract matched" : "Contract diverged";
  const statusClass = result.matches ? "pass" : "fail";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(title)} — ${escapeHtml(result.name)} — Announce Check</title>
  <style>
    :root{--paper:#f4f0e6;--lift:#fffdf7;--ink:#171923;--muted:#5d5f68;--blue:#2446d8;--coral:#c23b2a;--green:#1d7148;--rule:#cbc5b9}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace}.skip{position:absolute;left:1rem;top:-5rem;background:var(--ink);color:white;padding:.75rem;z-index:2}.skip:focus{top:1rem}header,main,footer{width:min(1120px,calc(100% - 2rem));margin:auto}header{padding:3rem 0 2rem;border-bottom:1px solid var(--rule)}.eyebrow{color:var(--blue);font-weight:800;text-transform:uppercase;letter-spacing:.08em}h1{font:clamp(2.2rem,7vw,4.5rem)/.98 Iowan Old Style,Palatino Linotype,Georgia,serif;margin:.35rem 0 1rem;max-width:12ch}.summary{display:inline-flex;gap:.6rem;align-items:center;padding:.5rem .75rem;border:2px solid currentColor;font-weight:800}.summary.pass{color:var(--green)}.summary.fail{color:var(--coral)}main{padding:2.5rem 0}.meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin:0 0 3rem}.meta div{border-top:3px solid var(--ink);padding-top:.75rem}.meta dt{color:var(--muted);font-size:.875rem}.meta dd{margin:.2rem 0;overflow-wrap:anywhere;font-weight:700}.comparison{display:grid;grid-template-columns:1fr 1fr;gap:2rem}.comparison h2{font:2rem/1.1 Iowan Old Style,Palatino Linotype,Georgia,serif;margin:0 0 1rem}.comparison ol{list-style:none;padding:0;margin:0;border-top:1px solid var(--rule)}.comparison li{display:grid;grid-template-columns:2.5rem minmax(0,1fr) auto;gap:.75rem;padding:1rem .5rem;border-bottom:1px solid var(--rule);align-items:start}.comparison li.different{background:#f8dfd7;outline:2px solid var(--coral)}code{font:inherit;font-weight:700;overflow-wrap:anywhere}.index,.step{color:var(--muted);font-size:.875rem}.marker{grid-column:2/-1;color:var(--coral);font-size:.875rem}.empty{display:flex!important;flex-direction:column}.notice{margin:3rem 0 0;padding:1rem;border-left:5px solid var(--blue);max-width:70ch}footer{padding:2rem 0;border-top:1px solid var(--rule);color:var(--muted)}:focus-visible{outline:3px solid var(--blue);outline-offset:3px}@media(max-width:700px){header{padding-top:2rem}.meta,.comparison{grid-template-columns:1fr}.comparison{gap:2.5rem}.comparison li{grid-template-columns:2.25rem minmax(0,1fr)}.step{grid-column:2}.meta{margin-bottom:2rem}}@media(prefers-reduced-motion:no-preference){.comparison li{animation:reveal .24s ease both;animation-delay:calc(var(--i,0)*35ms)}@keyframes reveal{from{opacity:0;transform:translateY(5px)}}}
  </style>
</head>
<body>
  <a class="skip" href="#report">Skip to report</a>
  <header>
    <p class="eyebrow">Announce Check / local report</p>
    <h1>${escapeHtml(title)}</h1>
    <p class="summary ${statusClass}">${result.matches ? "✓" : "×"} ${result.matches ? "Expected and received are identical" : `Difference at event ${(result.diff.firstDifference ?? 0) + 1}`}</p>
  </header>
  <main id="report">
    <dl class="meta"><div><dt>Flow</dt><dd>${escapeHtml(result.name)}</dd></div><div><dt>Target</dt><dd>${escapeHtml(result.url)}</dd></div><div><dt>Duration</dt><dd>${escapeHtml(result.durationMs)} ms</dd></div></dl>
    <div class="comparison">
      <section aria-labelledby="expected-heading"><h2 id="expected-heading">Expected</h2><ol>${rows(result.expected, result.diff.firstDifference)}</ol></section>
      <section aria-labelledby="received-heading"><h2 id="received-heading">Received</h2><ol>${rows(result.received, result.diff.firstDifference)}</ol></section>
    </div>
    <p class="notice"><strong>Scope:</strong> ${escapeHtml(result.notice)}</p>
  </main>
  <footer>Generated locally by Announce Check. Form values are not included.</footer>
</body>
</html>`;
}
