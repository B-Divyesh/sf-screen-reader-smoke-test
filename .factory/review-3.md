# Adversarial first-read review 3 — FAIL

Date: 2026-08-30 UTC

Live URL: <https://screen-reader-smoke-test.sociobot.in/>

Candidate and live content: `b7f952dbd8418214808a2ca8d55d941d1f28ab6e`

Viewports: fresh 390 × 844 mobile, 1280 × 800 desktop, and 1440 ×
900 desktop contexts

## Verdict

**FAIL.** The first screen is clear, the one-click demo works, all 14 declared
claim commands pass, and the live deployment matches the clean checkout. The
product still has one blocking regression: internal navigation no longer
moves focus to or announces the destination heading. One public exit-code
promise is not covered by its claim entry, public copy uses multiple names and
internal jargon for the demo/privacy model, and the stored copy audit is not an
accurate sentence inventory. A pass requires zero findings.

## Findings

### F-1-1 — BLOCKING — route focus and announcement regressed

- **Exact location/evidence:** From `/`, activating **“Try it with sample
  data”** loads `/demo/?demo=1`, but `document.activeElement` is `BODY` at both
  390 × 844 and 1280 × 800. The destination `<h1>` has no `tabindex`, and there
  is no route-announcement live region. Browser Back leaves focus on `BODY`
  again. The demo's only live region contains the comparison result, not the
  page heading. Commit `7e6cd05` removed `site/route.ts`, every
  `#route-announcement`, and heading focus. The current test checks that a cold
  page starts on `body`, but no test checks focus after internal navigation.
- **Why this fails:** A keyboard or screen-reader visitor receives no explicit
  destination cue after following an internal route or returning with Back.
  This is the exact F-1-1 behavior that review 1 required and polish 1 marked
  fixed. It also fails the current route-change requirement. The cold-load
  skip-link correction did not require removing route-change focus.
- **Concrete fix:** Preserve `body` focus on a direct cold load so the first
  Tab still reaches the skip link. For a same-origin route activation and a
  Back/Forward restoration only, focus the destination `<h1>` with
  `preventScroll: true` and copy its text into a visually hidden
  `aria-live="polite"` status. Add one regression that proves both behaviors:
  cold load → first Tab reaches Skip; internal link → destination h1; Back →
  restored page h1 and announcement.

### F-3-1 — MAJOR — the browser-failure exit-code claim is not declared or tested

- **Exact quote/location:** README Usage says **“It exits 1 on an event-list
  difference and 2 for invalid input or a browser failure.”** The CLI help also
  promises **“2 Configuration, target, or browser error.”** The
  `cli-exit-codes` manifest entry promises only invalid input, and its tagged
  packed-consumer test proves exit 2 only with `--unknown`.
- **Why this fails:** A user can rely on exit 2 to distinguish infrastructure
  failure in automated checks, but the required clean-sandbox test never makes
  Chromium fail. The implementation's broad catch is not a substitute for an
  observable packaged-CLI test.
- **Concrete fix:** Expand the `cli-exit-codes` claim text to include target and
  browser failures. In the one tagged packed-consumer test, run once against an
  unreachable target and once with Chromium unavailable, then assert exit 2
  and the relevant error output. Alternatively, narrow README and help copy to
  the invalid-input behavior that is tested.

### F-3-2 — MINOR — demo/privacy copy uses inconsistent terms and internal jargon

- **Exact quotes/locations:** The landing route and banner call the sample
  workspace **“Demo”** and **“Try it with sample data.”** README calls the same
  route **“Try the sample”** and later **“the playground.”** README also says
  **“remote fixture storage,” “third-party runtime requests,”** and
  **“third-party runtime assets.”**
- **Why this fails:** A first-time reader has to decide whether demo, sample,
  and playground are different features. The privacy phrases describe an
  implementation category instead of the concrete fact that no test data is
  hosted and no files or requests go to another site.
- **Concrete fix:** Use **demo** for the workspace everywhere: heading **“Try
  the demo”** and **“The guide and demo work offline after one online visit.”**
  Rewrite the privacy lines as **“The demo stores no cookies or personal data
  and sends requests only to this site.”** and **“The project has no tracking,
  accounts, cookies, hosted test data, or files loaded from other sites.”**

### F-3-3 — MINOR — the repository copy audit is not an accurate sentence inventory

- **Exact location/evidence:** `.factory/copy-audit.md` records the README
  opening sentence as 14 words; it has 16. It records the next sentence as 14;
  it has 18. It omits the sentence **“Open
  https://screen-reader-smoke-test.sociobot.in/demo/.”** It also combines the
  two footer sentences into one row. The corrected inventories appear below.
- **Why this fails:** This does not change the visible copy, but it makes the
  required simplicity proof unreliable and can hide future over-limit copy.
- **Concrete fix:** Regenerate `.factory/copy-audit.md` from the exact rendered
  strings and README prose with a documented tokenizer. Include linked
  imperative sentences, keep footer sentences separate, and test the inventory
  against source copy.

## Cold first read

Before scrolling, my own reading was:

- **What it does:** catches changes to keyboard focus and status messages in
  one browser form flow.
- **For whom:** small web teams checking a critical form flow before release.
- **What to click first:** **“Try it with sample data.”** The adjacent sentence
  says it loads an event list and shows the first change.

All three answers are available at both cold widths. At 390 × 844, the action
ends at y=540, its explanation at y=599, and all three facts at y=704. At
1440 × 900, the corresponding bottoms are y=768, y=764, and y=873. The first
screen gate passes.

## Copy audit

Counts split on whitespace, treat hyphenated terms and version numbers as one
word, and exclude standalone punctuation. Commands, code samples, and event
fixture rows are excluded. No sentence exceeds 22 words and no banned
marketing adjective appears. `⚑` marks text covered by a finding.

### Landing-page sentences and dynamic messages

| Words | Sentence |
| ---: | --- |
| 2 | You’re offline. |
| 11 | The guide and sample report still work; installation needs a connection. |
| 7 | Catch changed keyboard focus and status messages. |
| 11 | For small web teams checking one critical form flow before release. |
| 10 | Loads a sample event list and shows its first change. |
| 4 | Filled values are redacted. |
| 6 | Works offline after your first visit. |
| 5 | Free under the MIT License. |
| 18 | A precise cobalt path connects focus nodes, splits at a coral divergence, and expands into dark announcement arcs. |
| 7 | Focus steps lead to one visible announcement. |
| 5 | Play the approved browser flow. |
| 5 | Record focus and status messages. |
| 5 | Stop at the first difference. |
| 4 | Review each expected event. |
| 11 | The saved event list records keyboard focus and screen-reader status messages. |
| 10 | Your team approves it before automated checks compare later runs. |
| 5 | Find the first changed event. |
| 5 | Try each report state here. |
| 11 | The CLI writes the same comparison beside your local test run. |
| 3 | No expected events. |
| 4 | Expected event list unavailable. |
| 4 | No accessibility events captured. |
| 4 | Chromium could not start. |
| 4 | Check could not run. |
| 8 | Choose another state to inspect an event list. |
| 7 | Install Chromium with: npx playwright install chromium. |
| 12 | Move focus or update a role=status / aria-live region in the scripted flow. |
| 15 | First difference at event 3: review the status message or update the approved event list. |
| 3 | Install command copied. |
| 7 | Select the command and copy it manually. |
| 4 | Keep the human check. |
| 15 | Run Announce Check before release, then verify the release candidate with a real screen reader. |
| 4 | Install the tested package. |
| 7 | Announce Check compares one checked-in browser flow. |
| 6 | Version 0.1.0 · Built by Param Factory. |

Landing headings and controls were also checked. The section headings name
their content, and all action controls use a verb that identifies the result:
`Try it with sample data`, `Copy install command`, `Show matching report`,
`Show first difference`, `Show empty capture`, `Show browser error`, and
`Download package (.tgz)`. No landing-copy finding remains beyond terminology
shared with F-3-2.

### README sentences

| Words | Sentence |
| ---: | --- |
| 16 | Announce Check compares a saved list of keyboard-focus and status-message events for one critical browser flow. |
| 18 | It runs Chromium, compares the new event list with the approved list, and writes a local HTML report. |
| 15 | It is for small web teams checking a signup, search, or form flow before release. |
| 6 | Announce Check observes browser accessibility events. |
| 11 | It does not emulate NVDA, VoiceOver, JAWS, or certify WCAG conformance. |
| 10 | Keep a short manual screen-reader check in your release process. |
| 7 | Install version 0.1.0 from the documentation site. |
| 2 | Open https://screen-reader-smoke-test.sociobot.in/demo/. |
| 16 | It loads an approved signup event list and a changed received event list in one click. |
| 9 | Edit either input to see the first changed event. |
| 5 | Reset restores the bundled sample. |
| 10 | ⚑ The guide and playground work offline after one online visit. |
| 15 | ⚑ The demo stores no cookies or personal browser data and sends no third-party runtime requests. |
| 12 | Record the first local event list, review it, and check it in. |
| 6 | Then run it in automated checks. |
| 9 | The command exits 0 on a match or update. |
| 16 | ⚑ It exits 1 on an event-list difference and 2 for invalid input or a browser failure. |
| 5 | It writes announce-check-report/index.html by default. |
| 6 | --json writes one result to stdout. |
| 7 | Use --report &lt;directory&gt; to move the report. |
| 5 | Use --no-report to skip it. |
| 5 | Loopback URLs work by default. |
| 7 | A remote staging URL requires allowRemote: true. |
| 12 | Only test a remote system you own or are authorized to test. |
| 12 | Announce Check redacts filled values from events, console output, JSON, and reports. |
| 8 | The package ships ESM, CommonJS, and TypeScript declarations. |
| 9 | Its public API is defineConfig, runCheck, compareTranscripts, and renderReport. |
| 13 | npm run build produces the publishable library and the static site at dist/site/. |
| 6 | The versioned download is in dist/site/downloads/. |
| 8 | Run the site locally with npm run dev:site. |
| 14 | ⚑ The project has no tracking, accounts, cookies, remote fixture storage, or third-party runtime assets. |
| 8 | Reports and event lists stay on your machine. |
| 5 | MIT © 2026 Sociobot (Param Factory). |

README headings are `Announce Check`, `Install`, `Try the sample` (F-3-2),
`Usage`, `Supported steps`, `Programmatic API`, `Develop and verify`, and
`License`. The technical reference fragments for `fill`, `click`, `press`,
`goto`, and `wait` are usable in that context. No sentence exceeds the hard
cap; the flags are F-3-1 and F-3-2.

## Demo and sandbox verification

- The home action reaches `/demo/?demo=1` in one click. The first post-click
  screen contains a realistic three-event signup example, **“First difference
  at event 3,” “Account created,”** and **“Check your inbox.”** The complete
  result ends at y=782 of 844 on mobile and y=731 of 900 on desktop.
- The persistent banner reads **“Demo — sample data, nothing is saved”** and
  exposes **Reset demo** and **Open install instructions**.
- Matching the received input produces **“No differences found.”** Invalid
  input identifies line 1 and the required prefixes. Reset restores both
  bundled inputs, restores the event-3 difference, focuses the expected input,
  and leaves that input below the sticky banner.
- Before and after edit, compare, invalid input, and Reset, fresh contexts had
  no cookies, localStorage, sessionStorage, or IndexedDB. Every request was to
  `screen-reader-smoke-test.sociobot.in`; no request failed and no console error
  occurred. There is no real-data store for demo mode to read or mutate.
- After service-worker control and an HTTP-cache clear, a live offline reload
  returned 200, displayed the offline banner, retained the populated result,
  and logged no failed or third-party request.

## Declared claims from a clean clone

I cloned commit `b7f952d` without hard links into
`/tmp/announce-check-review-3.HVJaYb/repo`, ran `npm ci`, and invoked every
exact `test` command in `.factory/claims.json` independently.

| Claim id | Result | Observable evidence |
| --- | --- | --- |
| `demo-first-difference` | PASS | Populated mobile/desktop demo, edit, compare, reset, focus, invalid input, and Axe checks. |
| `local-private-flow` | PASS | Loopback signup capture, redaction, local report, and saved-list recheck. |
| `site-no-tracking` | PASS | Same-origin requests and empty cookies/local/session/IndexedDB. |
| `offline-demo` | PASS | Fresh service-worker context reloaded and compared offline. |
| `download-package` | PASS | Built tarball installed and ran in an empty consumer. |
| `cli-exit-codes` | PASS | Match/update 0, difference 1, and unknown-option input 2; F-3-1 records the untested extension. |
| `ci-recheck` | PASS | Packed CLI compared a saved event list without prompts. |
| `cli-output-modes` | PASS | Default/custom/no report and JSON output behaved as declared. |
| `build-artifacts` | PASS | Library, site, and versioned download were built. |
| `local-site` | PASS | The documented development command served HTTP content. |
| `origin-boundary` | PASS | Remote targets were rejected without authorization. |
| `workflow-steps` | PASS | Fill, click, press, navigation, and waits executed. |
| `package-formats` | PASS | ESM, CommonJS, declarations, public API, and binary loaded. |
| `mit-license` | PASS | Package metadata and license grant matched MIT. |

No declared claim command failed. The built and live tarballs had the same
SHA-256, `2924e0837edd70b7b51f6d35aaa4c0af44673f792c60dd5ab91d2d2b0e5c23c3`.
The public browser-failure promise is the unlisted/under-scoped claim in
F-3-1.

## History verification

I read `.factory/review-1.md`, `.factory/review-2.md`, all three
`.factory/polish-*.md` files, and the prior handoff. Each earlier review finding
was checked on production and in source rather than accepted from its status
label.

| Earlier finding | Round-3 result |
| --- | --- |
| F-1-1 route focus/announcement | **REGRESSED — BLOCKING.** Reopened above with the same id. |
| F-1-2 route metadata | FIXED. Exact title, description, canonical, OG, and Twitter data exist on all routes and 404. |
| F-1-3 footer/external link | FIXED. Every route has version, factory attribution, Privacy, Terms, and explicit external-source wording. |
| F-1-4 automated-check claim | FIXED. `ci-recheck` exists and its exact command passes. |
| F-1-5 result-naming language | FIXED. Live previews and generated reports use `No differences found` / `First difference found`; tests reject both old phrases. |
| F-1-6 first-read jargon | FIXED at the cited landing sentence. The separate remaining README wording is F-3-2. |
| F-2-1 demo result below fold | FIXED. All promised difference text is in the first mobile and desktop screen. |
| F-2-2 registry/release claims | FIXED. The cited promises are absent. |
| F-2-3 CLI output claims | FIXED. `cli-output-modes` exists and passes. |
| F-2-4 build/local-site claims | FIXED. Both manifest entries and exact commands pass. |
| F-2-5 future change promise | FIXED. The cited Terms promise is absent. |
| F-2-6 event-list terminology | FIXED for event-list naming. F-3-2 concerns the separate demo/privacy vocabulary. |
| F-2-7 limits labels | FIXED. Navigation says `Limits`; the h2 names what the tool can and cannot prove. |
| F-2-8 shared header | FIXED. All five checked routes expose the same four links and destinations. |
| F-2-9 first-screen facts | FIXED. Redaction, offline, and MIT facts are fully visible at 390×844, 1280×800, and 1440×900. |

The polish-3 controller finding C-3-1 also remains fixed: the full suite and
14 repeated filtered commands exited cleanly, and no Vite process remained.
Polish finding P-3-1 remains fixed: after Reset at 390 px, the focused input
began at y=359 while the banner ended at y=108.

## Structure, links, visual identity, and accessibility

- `/`, `/demo/`, `/privacy/`, and `/terms/` return 200. A missing route returns
  the designed 404 with HTTP 404. Each route has `lang=en`, one h1, one main,
  a route-specific title, description, canonical, complete OG/Twitter data,
  SVG favicon, and 180 px Apple icon. The OG image is 1200 × 630.
- The route titles follow the required pattern and are at most 60 characters.
  `robots.txt` allows crawling and points to a sitemap listing all four real
  routes. The deployment config supplies a valid 404 override and sends CSP,
  `frame-ancestors 'none'`, HSTS, `nosniff`, and strict-origin referrer policy
  as response headers.
- Every link crawled from the real routes returned 200, including both hash
  destinations, the versioned package, and the explicitly labelled GitHub
  source. The only non-200 was the deliberate missing-route document itself.
- Headers and footers are structurally consistent. Deep links and Back load the
  correct content, but focus/announcement fails as F-1-1 describes.
- Live Axe scans on home, demo, privacy, terms, and 404 at mobile and desktop
  reported zero violations. There is no horizontal overflow. Skip links,
  keyboard controls, 44 px targets, labels, alt text, visible focus, and
  reduced-motion overrides are present. The worker's `verify-url.sh` passed:
  one h1/main, `lang=en`, no missing alt text or unlabeled buttons, and no
  console errors.
- The production build is small: initial home JavaScript is 1.22 kB gzip plus
  a 0.40 kB polyfill; demo JavaScript is 1.31 kB gzip; CSS is 3.95 kB gzip.
- The identity is product-specific rather than a generic SaaS template: warm
  paper, cobalt construction paths, coral divergence marks, editorial serif
  headlines, monospaced event data, hard instrument shadows, and original
  focus-to-announcement artwork match `.factory/design.md`.

## Local quality gates

- `npm test` — PASS, 8 files / 28 tests.
- `npm run lint` — PASS.
- `npm run build` — PASS and produced `dist/library` and `dist/site`.
- `npm pack --dry-run --json --ignore-scripts` — PASS, 12 files and 51,943 B.
- `git diff --check` — PASS in the clean clone.

## Missed leverage

No AI, sync, or additional import/export finding is warranted. The deterministic
tool already consumes a checked-in event list, captures a new browser run, and
exports HTML or JSON. AI would make a regression oracle less predictable and
is not implied by the brief. No provider keys or runtime AI calls exist.

## What would make this perfect

Restore route-heading focus and a polite page-title announcement only for
internal navigation and Back/Forward, while retaining the cold-load skip-link
order. Cover the browser-failure exit promise in `claims.json` and its packaged
CLI test. Standardize demo/privacy wording and regenerate the exact copy audit.
Then rerun every claim and this entire live checklist from a fresh context.
