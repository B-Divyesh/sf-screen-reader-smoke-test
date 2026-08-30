# Adversarial first-read review 2 — FAIL

Date: 2026-08-30 UTC

Live URL: <https://screen-reader-smoke-test.sociobot.in/>

Candidate: `8a683fe202aca2c6df2bf78d6d6de15d0f8f6fb6`

Viewports: fresh 390 × 844 mobile and 1440 × 900 desktop contexts

## Verdict

**FAIL.** The cold landing page explains the job, audience, and first action,
and all 11 declared claim tests pass. The product still has two blocking
findings: the one-click demo hides its promised result below the first screen,
and the generated CLI report retains wording that review 1 explicitly required
removing. Eight further copy, claims, and structure findings remain. A pass
requires zero findings and no unlisted claim.

## Findings

### F-2-1 — BLOCKING — the one-click demo does not show its result on the first screen

- **Exact location/evidence:** The landing action promises **“Loads a signup
  transcript and shows its first change.”** After one click, `/demo/?demo=1`
  contains **“First difference found”** and **“First difference at event 3,”**
  but the result container begins at y=1,241 px in the 390 × 844 context and
  y=1,047 px in the 1440 × 900 context. On mobile, the first screen ends in the
  first “Expected transcript” input. On desktop, it ends in the two inputs.
- **Why this fails:** A first-time visitor sees sample setup, not the promised
  result. They must scroll past both large editors before seeing what the
  product found. This fails the library-playground requirement that the first
  post-click screen already show the product working on realistic sample data.
- **Concrete fix:** Put a compact populated result immediately below the demo
  heading and before the editors. At 390 × 844 it must visibly include “First
  difference at event 3” and the changed expected/received status messages.
  Keep the editors below it for interaction. Add a Playwright assertion that
  the populated result's bounding box intersects the initial viewport at both
  required sizes.

### F-1-5 — BLOCKING — review 1's result-language finding is only half fixed

- **Exact location/evidence:** Review 1 required replacing **“Contract
  diverged”** with **“First difference found”** and **“Contract matched”** with
  **“No differences found.”** The live preview and playground use the new
  wording, but `src/report.ts:25` still sets the generated report heading to
  `Contract matched` or `Contract diverged`. `test/runner.test.ts:56` explicitly
  preserves `Contract matched`.
- **Why this fails:** The downloaded CLI's primary output still uses the
  metaphorical term that the earlier finding rejected. Marking the landing
  preview fixed did not fix the real generated report. The history rule makes
  an unfixed or half-fixed earlier finding blocking again under the same id.
- **Concrete fix:** Change the generated report title and `<h1>` to **“No
  differences found”** and **“First difference found.”** Update the report and
  runner tests to assert those exact phrases and to reject both old strings.

### F-2-2 — unlisted registry and release claims

- **Exact quotes/locations:** Landing: **“The factory has not published the npm
  registry entry yet.”** README Install: **“The npm registry entry is not
  published yet.”** and **“The factory can publish the same tarball to npm after
  release approval.”** None has a `.factory/claims.json` entry.
- **Why this fails:** The first two statements affect which install path a
  visitor trusts. The third is a future release promise that the sandbox cannot
  prove. A live `npm view screen-reader-smoke-test version` currently returns
  404, but an ad hoc observation is not a manifest claim test.
- **Concrete fix:** Remove all three internal release-status sentences. Keep
  the useful instruction: **“Install version 0.1.0 from this site:”** If registry
  status must remain public, add a stable manifest claim and a release-safe test
  rather than a future promise.

### F-2-3 — unlisted CLI output-mode claims

- **Exact quotes/location:** README Usage says **“It writes
  announce-check-report/index.html by default.”**, **“`--json` writes one result
  to stdout.”**, **“Use `--report <directory>` to move the report.”**, and
  **“Use `--no-report` to skip it.”** Privacy repeats the default/`--no-report`
  behavior. No manifest entry names these four observable behaviors.
- **Why this fails:** `local-private-flow` proves that a caller-selected report
  directory can be written, while `cli-exit-codes` proves exit values. Neither
  claims or tests the documented default path, custom path option, JSON output,
  and absence of output under `--no-report` as one public contract.
- **Concrete fix:** Add a `cli-output-modes` claim. In one fresh packed-package
  consumer test, assert the default report path, valid JSON stdout, the custom
  report directory, and that `--no-report` creates no report.

### F-2-4 — unlisted build and local-site claims

- **Exact quotes/location:** README Develop and verify says **“`npm run build`
  produces the publishable library and the static site at `dist/site/`.”** and
  **“Run the site locally with `npm run dev:site`.”** No claim entry covers the
  complete build output or a reachable development site. The adjacent
  versioned-download sentence is covered by `download-package` and is not part
  of this finding.
- **Why this fails:** These are reproducible instructions a contributor can
  rely on, but the claims manifest does not name their outcomes. The general
  build passed during this review; that does not satisfy the one-entry,
  one-tagged-test contract.
- **Concrete fix:** Add a `build-artifacts` claim that runs the build and asserts
  library and site output. Add a `local-site` claim that
  starts the documented command and receives HTTP 200, or remove the local-site
  sentence from public copy.

### F-2-5 — unlisted change-notice promise

- **Exact quote/location:** Terms → Changes: **“Material changes will be dated
  on this page and recorded in the project changelog.”** There is no matching
  claim entry or enforceable test.
- **Why this fails:** This is a process promise a visitor could rely on, but it
  describes future conduct and cannot be established by the current sandbox.
- **Concrete fix:** Remove the promise. If a static statement is needed, use
  **“The effective date appears above. Released changes are listed in
  CHANGELOG.md.”** and add a source check if it remains a declared claim.

### F-2-6 — public copy uses inconsistent names and unexplained jargon

- **Exact quotes/locations:** The landing page alternates between **“approved
  browser event list,”** **“saved event list,”** and **“signup transcript.”** The
  README adds **“announcement contract,”** **“focus semantics,”** and **“ARIA
  live-region changes.”** The first-screen fact **“No accounts or telemetry”**
  uses an internal analytics term. `.factory/copy-audit.md` nevertheless says
  the one term for ordered observations is “transcript,” while its audited live
  copy also says “event list.” Its word counts are stale: for example, it lists
  the 11-word audience sentence as 10 words.
- **Why this fails:** A first-time visitor must infer whether a contract, event
  list, and transcript are different artifacts. The jargon appears before the
  README explains configuration syntax, and the repository's own terminology
  record contradicts the product.
- **Concrete fix:** Use **“event list”** for the ordered observations everywhere
  in first-read copy. Suggested README opening: **“Announce Check compares a
  saved list of keyboard focus and status-message events for one critical
  browser flow. It runs Chromium, compares the new event list with the approved
  list, and writes a local HTML report.”** Change the hero result line to
  **“Loads a sample event list and shows its first change.”** Change the fact to
  **“No account or tracking.”** Introduce ARIA and file-format terms only in the
  technical reference. Regenerate `.factory/copy-audit.md` from the exact copy.

### F-2-7 — the limits heading and navigation label do not name the section plainly

- **Exact quotes/location:** Home navigation: **“Honest limits.”** Home `<h2>`:
  **“Use it with a real screen reader.”**
- **Why this fails:** “Honest” is a promotional adjective, not information. The
  heading is advice; in a screen-reader heading list it does not identify that
  the section explains capabilities and limitations.
- **Concrete fix:** Rename the navigation link **“Limits”** and the `<h2>`
  **“What Announce Check can and cannot prove.”**

### F-2-8 — the primary header is inconsistent across routes

- **Exact location/evidence:** Desktop `/` shows **Demo · How it works · Honest
  limits · Install**; `/demo/` shows **Demo · Install**; `/privacy/`, `/terms/`,
  and the 404 show **Demo · Privacy**. The home header does not include Privacy.
- **Why this fails:** The required site skeleton calls for a consistent header
  on every route. A visitor moving to legal or demo pages loses the section
  links and cannot predict where the same navigation item will appear.
- **Concrete fix:** Render one shared header on every route, for example
  **Demo · How it works · Limits · Privacy**, with root-qualified anchors on
  non-home pages and `aria-current` on the active route. Add a route matrix test
  that asserts the same link names and destinations everywhere.

### F-2-9 — the first-screen facts omit required facts and one is clipped on desktop

- **Exact location/evidence:** The facts are **“Runs on your machine.”**,
  **“Redacts filled values.”**, and **“No accounts or telemetry.”** They cover
  locality/privacy twice but say nothing about offline availability or price.
  At 1440 × 900 the third fact occupies y=899–921, leaving only one pixel in the
  initial viewport.
- **Why this fails:** The prescribed first-screen facts are privacy, offline,
  and price. A desktop visitor cannot read all three without scrolling, and no
  visitor learns from the first screen that the guide works offline or that the
  package is free under MIT.
- **Concrete fix:** Use three tested facts such as **“Filled values are
  redacted.”**, **“Works offline after your first visit.”**, and **“Free under
  the MIT License.”** Reduce the desktop hero height/type/gaps so every fact is
  wholly visible at 1440 × 900 and 1280 × 800. Add viewport-bound assertions.

## Cold first read

Before scrolling, my own reading was:

- **What it does:** checks one browser flow for changed keyboard focus and
  status announcements.
- **For whom:** small web teams checking a critical form flow before release.
- **What to click first:** **“Try it with sample data.”**

All three answers are present at both tested widths. On mobile, the headline,
audience sentence, primary action, result description, and three current facts
end by y=745. On desktop, the action and its result description are visible,
but F-2-9 applies to the facts.

## Copy audit

Counts split on whitespace; hyphenated terms and version numbers count as one
word. Commands, code samples, and transcript fixture rows are excluded. No
sentence exceeds 22 words. Landing prose averages 7.0 words; README prose
averages 9.6 words. There are no banned marketing words. `⚑` marks copy tied to
a finding above.

### Landing-page sentences and dynamic messages

| Words | Sentence |
| ---: | --- |
| 2 | You’re offline. |
| 11 | The guide and sample report still work; installation needs a connection. |
| 6 | Catch changed focus and live announcements. |
| 11 | For small web teams checking one critical form flow before release. |
| 9 | ⚑ Loads a signup transcript and shows its first change. |
| 4 | Runs on your machine. |
| 3 | Redacts filled values. |
| 4 | ⚑ No accounts or telemetry. |
| 18 | A precise cobalt path connects focus nodes, splits at a coral divergence, and expands into dark announcement arcs. |
| 7 | Focus steps lead to one visible announcement. |
| 5 | ⚑ Play the approved browser flow. |
| 5 | Record focus and status messages. |
| 5 | Stop at the first difference. |
| 4 | Review each expected event. |
| 11 | ⚑ The saved event list records keyboard focus and screen-reader status messages. |
| 10 | Your team approves it before automated checks compare later runs. |
| 10 | ⚑ The factory has not published the npm registry entry yet. |
| 5 | Find the first changed event. |
| 5 | Try each report state here. |
| 11 | The CLI writes the same comparison beside your local test run. |
| 3 | No expected events. |
| 3 | ⚑ Expected transcript unavailable. |
| 4 | No accessibility events captured. |
| 4 | Chromium could not start. |
| 4 | Check could not run. |
| 7 | ⚑ Choose another state to inspect a transcript. |
| 7 | Install Chromium with: npx playwright install chromium. |
| 13 | Move focus or update a role=status / aria-live region in the scripted flow. |
| 15 | First difference at event 3: review the status message or update the approved event list. |
| 3 | Install command copied. |
| 7 | Select the command and copy it manually. |
| 7 | ⚑ Use it with a real screen reader. |
| 4 | Keep the human check. |
| 15 | Run Announce Check before release, then verify the release candidate with a real screen reader. |
| 4 | Install the tested package. |
| 7 | Announce Check compares one checked-in browser flow. |
| 7 | Version 0.1.0 · Built by Param Factory. |

### Landing headings, controls, and fragments

The non-sentence copy is: `Skip to main content`; `Announce Check`; `Demo`;
`How it works`; `Honest limits` ⚑; `Install`; `Local accessibility check`;
`Try it with sample data`; `Drive`; `Observe`; `Compare`; `Approved browser
event list` ⚑; `Install version 0.1.0 from this site`; `Copy install command`;
`Local HTML report`; `Show matching report`; `Show first difference`; `Show
empty capture`; `Show browser error`; `No differences found`; `No events
captured`; `First difference found`; `Expected`; `Received`; `Run error`;
`Scope and limits`; `What it catches`; `A label disappears from the focused
field`; `Focus lands in an unexpected place`; `A status or alert is missing,
changed, or reordered`; `What it does not claim`; `Exact NVDA, VoiceOver, or
JAWS speech`; `Complete accessibility coverage`; `WCAG conformance or
certification`; `Version 0.1.0`; `Download package (.tgz)`; `Privacy`; `Terms`;
and `Source (GitHub, opens external site)`.

All buttons and action links use result-naming verbs. `Honest limits` and the
limits `<h2>` are the heading flag in F-2-7. The terminology flags are F-2-6.

### README sentences

| Words | Sentence |
| ---: | --- |
| 11 | ⚑ Announce Check tests the announcement contract for one critical browser flow. |
| 11 | ⚑ It drives Chromium and records focus semantics and ARIA live-region changes. |
| 13 | ⚑ It compares them with a checked-in transcript and writes a local HTML report. |
| 15 | It is for small web teams checking a signup, search, or form flow before release. |
| 10 | ⚑ Announce Check observes browser accessibility semantics and ARIA live-region changes. |
| 11 | It does not emulate NVDA, VoiceOver, JAWS, or certify WCAG conformance. |
| 10 | Keep a short manual screen-reader check in your release process. |
| 8 | ⚑ The npm registry entry is not published yet. |
| 9 | Install the tested versioned tarball from the documentation site. |
| 12 | ⚑ The factory can publish the same tarball to npm after release approval. |
| 14 | ⚑ It loads an approved signup transcript and a changed received transcript in one click. |
| 9 | Edit either input to see the first changed event. |
| 5 | Reset restores the bundled sample. |
| 10 | The guide and playground work offline after one online visit. |
| 15 | The demo stores no cookies or personal browser data and sends no third-party runtime requests. |
| 11 | ⚑ Record the first local contract, review it, and check it in. |
| 6 | Then run it in automated checks. |
| 9 | The command exits 0 on a match or update. |
| 16 | It exits 1 on a transcript difference and 2 for invalid input or a browser failure. |
| 5 | ⚑ It writes announce-check-report/index.html by default. |
| 6 | ⚑ `--json` writes one result to stdout. |
| 7 | ⚑ Use `--report <directory>` to move the report. |
| 5 | ⚑ Use `--no-report` to skip it. |
| 5 | Loopback URLs work by default. |
| 7 | A remote staging URL requires `allowRemote: true`. |
| 12 | Only test a remote system you own or are authorized to test. |
| 12 | Announce Check redacts filled values from events, console output, JSON, and reports. |
| 8 | The package ships ESM, CommonJS, and TypeScript declarations. |
| 9 | Its public API is defineConfig, runCheck, compareTranscripts, and renderReport. |
| 13 | ⚑ `npm run build` produces the publishable library and the static site at dist/site/. |
| 6 | The versioned download is in dist/site/downloads/. |
| 8 | ⚑ Run the site locally with `npm run dev:site`. |
| 14 | ⚑ The project has no telemetry, accounts, cookies, remote fixture storage, or third-party runtime assets. |
| 7 | ⚑ Reports and transcripts stay on your machine. |
| 6 | MIT © 2026 Sociobot (Param Factory). |

README headings are `Announce Check`, `Install`, `Try the sample`, `Usage`,
`Supported steps`, `Programmatic API`, `Develop and verify`, and `License`; each
names its section. The supported-step fragments are technical reference copy:
`fill — target by associated label or CSS selector`; `click — target by
accessible role and name, label, or CSS selector`; `press — send a key such as
Enter, Tab, or ArrowDown`; `goto — navigate to an absolute authorized URL or a
path relative to url`; and `wait — wait for milliseconds, a visible CSS
selector, or visible text`. They are usable in context and need no rewrite.

## Demo and sandbox verification

- The home action reaches `/demo/?demo=1` in one click and loads a realistic
  three-event signup sample. F-2-1 records the first-screen failure.
- The persistent banner says **“Demo — sample data, nothing is saved”** and
  exposes **Reset demo** and **Open install instructions**.
- After replacing the received input, comparison moved the first difference to
  event 1. Reset restored the bundled changed event at event 3 and focused the
  expected input.
- Fresh mobile and desktop contexts had no cookies, localStorage,
  sessionStorage, or IndexedDB. Every online request was same-origin. Demo state
  exists only in form controls; no real-data store exists to read or mutate.
- In a fresh live service-worker context, clearing the HTTP cache, going
  offline, and reloading `/demo/?demo=1` returned 200, displayed the offline
  banner, and kept **“First difference found.”** The request log contained only
  the product origin and had no failures. The only storage was the documented
  public shell cache.

## Declared claims from a clean clone

I cloned commit `8a683fe` to
`/tmp/announce-check-review-2-W0dy7a`, ran `npm ci`, and then ran every exact
`test` command in `.factory/claims.json` independently.

| Claim id | Result | Observable evidence |
| --- | --- | --- |
| `demo-first-difference` | PASS | Populated desktop/mobile playground, edit, compare, reset, format error, Axe. |
| `local-private-flow` | PASS | Loopback capture, value redaction, local report, matching recheck. |
| `site-no-tracking` | PASS | Same-origin requests; no cookies, local/session storage, or IndexedDB. |
| `offline-demo` | PASS | Fresh service-worker context reloaded and compared offline. |
| `download-package` | PASS | Site tarball installed and ran in an empty consumer. |
| `cli-exit-codes` | PASS | Update/match 0, difference 1, invalid option 2. |
| `ci-recheck` | PASS | Packed CLI compared a saved event list without prompts. |
| `origin-boundary` | PASS | Remote target blocked without explicit authorization. |
| `workflow-steps` | PASS | Fill, click, press, goto, and waits executed. |
| `package-formats` | PASS | ESM, CommonJS, declarations, API, and binary loaded. |
| `mit-license` | PASS | Package metadata and shipped MIT text matched. |

The downloaded live tarball and the clean clone's built tarball had the same
SHA-256, `60cebc536cd1244e862672c2d18f1cd561d693d6ee8cc1fb32642883b3e69384`.
The unlisted public claims are findings F-2-2 through F-2-5.

## History verification

I read `.factory/review-1.md`, `.factory/polish-1.md`, and the existing
`.factory/handoff.md`, then checked each earlier finding on the live site and in
source.

| Earlier finding | Result in round 2 |
| --- | --- |
| F-1-1 route focus/announcement | FIXED — home → demo and Back focus the destination `<h1>` and update the polite announcement; `site/route.ts` and its regression remain. |
| F-1-2 route metadata | FIXED — Demo, Privacy, Terms, and 404 have route titles, descriptions, canonical, OG, and Twitter metadata. |
| F-1-3 footer/external link | FIXED — every route has version, exact factory attribution, Privacy, Terms, and an explicit external Source label. |
| F-1-4 automated-check claim | FIXED — `ci-recheck` exists and its exact clean-clone test passes. |
| F-1-5 result-naming language | **NOT FULLY FIXED — BLOCKING**; the live controls changed, but the generated report still uses both rejected phrases. |
| F-1-6 first-read jargon | FIXED at the exact earlier landing sentence; new repository-wide terminology issues are F-2-6. |

## Structure, links, visual identity, and accessibility

- Titles match the required route pattern and remain under 60 characters.
  Every route, including the designed HTTP-404 page, has one `<h1>`, one
  `<main>`, `lang=en`, description, canonical, OG/Twitter metadata, SVG favicon,
  and 180 px Apple touch icon. The OG image is 1200 × 630.
- Direct routes return the correct content. Home → demo and browser Back focus
  and announce the destination heading. The home, demo, privacy, terms,
  download, and GitHub destinations returned 200. The sole 404 during the crawl
  was the deliberate missing route and its same-document skip-link URL.
- The footer is consistent. The header failure is F-2-8.
- The response sends the self-only CSP, `frame-ancestors 'none'`, HSTS,
  `nosniff`, and strict-origin referrer policy as headers. No third-party font,
  script, tracking, or runtime API request was observed.
- Playwright Axe found zero serious or critical violations on home, demo,
  privacy, terms, and the designed 404 at both viewports. There was no
  horizontal overflow. Reduced-motion contexts reduced animations to 0.01 ms.
  The live home and product routes emitted no console/page errors; the browser's
  expected failed-resource message appeared only for the deliberate HTTP 404.
- The visual identity is distinct rather than a generic SaaS template: warm
  paper, cobalt construction lines, serif headlines, monospaced interface copy,
  original focus-to-announcement geometry, hard instrument shadows, and no
  gradient hero. It matches `.factory/design.md`.
- `/opt/fleet/lib/verify-url.sh` passed the live home. The full local suite
  passed 22/22 tests; `npm run lint`, `npm run build`, package dry-run, and
  `git diff --check` passed. Initial built JavaScript is about 1.7 KB gzip.

## Missed leverage

No AI, import/export, or sync finding is warranted. The deterministic CLI
already imports a checked-in event list, captures a new run, compares it, and
exports a local HTML report/JSON result. An AI step would make a test oracle
less predictable and is not implied by the brief. No provider key or runtime AI
call exists.

## What would make this perfect

Move the populated first-difference result into the initial demo viewport and
finish the F-1-5 wording repair in the real generated report. Then remove or
test every unlisted public claim, standardize “event list” terminology, rename
the limits section plainly, use one shared header, and put tested privacy,
offline, and price facts fully above the fold. Re-run this complete review from
a clean clone; perfection means no finding remains.
