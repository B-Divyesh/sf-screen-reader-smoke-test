# Adversarial first-read review 1 — FAIL

Date: 2026-08-30 UTC
URL reviewed: <https://screen-reader-smoke-test.sociobot.in/>
Viewports: fresh 390 × 844 mobile context and fresh 1280 × 800 desktop context

## Verdict

**FAIL.** The product is clear and tryable, and every declared claim test passed, but the findings below mean there is still work to do. F-1-1 is blocking because route changes leave focus on `body`; the other findings are specific release-quality gaps.

## Cold first read

Before scrolling, the page says: this is a local check that catches changed keyboard focus and live announcements in a critical form flow. It is for small web teams before release. Click **“Try it with sample data”** first; it loads a signup transcript and points out its first change.

All three answers were available on the first screen at both viewports. The 390 px primary action began at y=528, and the supporting result line began at y=596; neither required scrolling. This gate passes.

## Findings

### F-1-1 — BLOCKING — navigation does not move focus or announce the new page

- **Location / evidence:** From `/`, activating **“Try it with sample data”** loaded `/demo/` successfully, but `document.activeElement` was `BODY`, not the demo `<h1>`. Browser Back returned to `/` with focus again on `BODY`.
- **Why this fails:** A keyboard or screen-reader visitor gets no reliable indication that a new page has loaded or where the new content begins. This fails the route-change focus and announcement requirement.
- **Concrete fix:** Give each destination `h1` `tabindex="-1"`; after `DOMContentLoaded`/`pageshow`, move focus to it and write its text to one visually-hidden `aria-live="polite"` region. Preserve the browser's restored scroll position on Back instead of forcing top-of-page focus in that case. Add a Playwright regression that follows each internal route and asserts focus and the live announcement.

### F-1-2 — metadata is incomplete outside the home page

- **Location / exact evidence:** `/demo/`, `/privacy/`, and `/terms/` expose only `<meta name="twitter:card" content="summary_large_image">`; each is missing `twitter:title`, `twitter:description`, and `twitter:image`. The designed 404 at `/missing-review-route` has no meta description, canonical link, Open Graph metadata, or Twitter metadata.
- **Why this fails:** Shared links and route-level search metadata are incomplete for every non-home product route, including the error route.
- **Concrete fix:** Add complete, route-specific Twitter title, description, and image tags to Demo, Privacy, and Terms. Add a plain meta description, canonical URL, OG title/description/image/url, and Twitter equivalent to `404.html`; add metadata assertions to the site test.

### F-1-3 — footer and external-link contract is incomplete

- **Location / exact evidence:** Every footer omits a version or build id. The home footer says **“Announce Check is an open local tool by Param Factory.”** rather than the required **“Built by Param Factory”** attribution. Every footer's GitHub link is labelled only **“Source”** although it opens an external origin.
- **Why this fails:** The standard footer cannot identify the deployed build, does not use the required factory attribution, and does not warn a screen-reader visitor that Source leaves the site.
- **Concrete fix:** Add a stable version/build line, for example `Version 0.1.0 · Built by Param Factory`, to every footer. Rename the link `Source (GitHub, opens external site)` and include visually-hidden external wording if the compact visual label must remain short. Test footer contents on all routes.

### F-1-4 — unlisted, untested CI claims remain in public copy

- **Location / exact quotes:** Landing page: **“Your team reviews it and CI compares later runs.”** and **“Use Announce Check to protect the contract on every commit, then verify the release candidate with a real screen reader.”** README: **“Then verify it in CI:”**
- **Why this fails:** `.factory/claims.json` contains no CI claim or `@claim:` test. The existing local-flow claim proves a local recheck, not a non-interactive CI execution. These are reliance claims, not merely labels.
- **Concrete fix:** Either delete the CI/“every commit” promises, or add a `ci-recheck` entry that invokes the packed CLI non-interactively in a clean project and asserts its expected exit result; tag that test `@claim:ci-recheck`. If retained, use the plain wording “Your automated checks compare future runs.”

### F-1-5 — several controls and status labels are not plain result-naming language

- **Location / exact quotes:** The landing report controls are **“✓ Match”**, **“× Divergence”**, **“○ No events”**, and **“! Browser error”**. The install control is **“Copy”**. The demo banner link is **“Start for real”**. The demo opens with **“Contract diverged”**.
- **Why this fails:** State nouns and the metaphorical “contract” do not say what clicking or the result means. “Copy” does not identify what is copied; “Start for real” actually opens installation instructions.
- **Concrete fix:** Use `Show matching report`, `Show first difference`, `Show empty capture`, `Show browser error`, `Copy install command`, and `Open install instructions`. Replace `Contract diverged` with `First difference found` and `Contract matched` with `No differences found`.

### F-1-6 — copy uses unexplained jargon where plainer wording is available

- **Location / exact quote:** **“The JSON transcript records focus and live-region events. Your team reviews it and CI compares later runs.”**
- **Why this fails:** “JSON,” “live-region,” and “CI” force a first-time small team to translate a sentence that should explain the product. `CI` also creates the unlisted claim in F-1-4.
- **Concrete fix:** Write: `The saved event list records keyboard focus and screen-reader status messages. Your team approves it before automated checks compare later runs.` Add the technical terms below this sentence only where configuration syntax is being explained.

## Copy audit

Counts treat hyphenated words and version numbers as one word. Commands, code examples, transcript fixtures, and URL-only links are excluded. No audited sentence exceeds 22 words and none contains a banned marketing adjective. The flags are F-1-4 through F-1-6 above; the remaining wording has no copy finding.

### Landing-page sentences and dynamic messages

| Words | Text |
| ---: | --- |
| 6 | Catch changed focus and live announcements. |
| 10 | For small web teams checking one critical form flow before release. |
| 9 | Loads a signup transcript and shows its first change. |
| 4 | Runs on your machine. |
| 3 | Redacts filled values. |
| 4 | No accounts or telemetry. |
| 7 | Focus steps lead to one visible announcement. |
| 4 | Review each expected event. |
| 8 | The JSON transcript records focus and live-region events. |
| 9 | Your team reviews it and CI compares later runs. |
| 9 | The factory has not published the npm registry entry yet. |
| 5 | Find the first changed event. |
| 5 | Try each report state here. |
| 11 | The CLI writes the same comparison beside your local test run. |
| 3 | No expected events. |
| 4 | Expected transcript unavailable. |
| 4 | No accessibility events captured. |
| 4 | Chromium could not start. |
| 4 | Check could not run. |
| 8 | Choose another state to inspect a transcript. |
| 14 | First difference at event 3: review the status text or update the approved contract. |
| 13 | Move focus or update a role=status / aria-live region in the scripted flow. |
| 7 | Use it with a real screen reader. |
| 4 | Keep the human check. |
| 19 | Use Announce Check to protect the contract on every commit, then verify the release candidate with a real screen reader. |
| 4 | Install the tested package. |
| 9 | Announce Check is an open local tool by Param Factory. |

Non-sentence headings, labels, controls, and list items were also checked: `Local accessibility check`; `Try it with sample data`; `Play the approved browser flow`; `Record focus + ARIA live changes`; `Stop at the first divergence`; `Checked-in browser contract`; `Install version 0.1.0 from this site`; `Copy`; `Local HTML report`; `Match`; `Divergence`; `No events`; `Browser error`; `Scope and limits`; `What it catches`; `A label disappears from the focused field`; `Focus lands in an unexpected place`; `A status or alert is missing, changed, or reordered`; `What it does not claim`; `Exact NVDA, VoiceOver, or JAWS speech`; `Complete accessibility coverage`; `WCAG conformance or certification`; `Version 0.1.0`; `Download package (.tgz)`. The controls and jargon flagged above require revision; the informative headings otherwise name their sections.

### README sentences

| Words | Text |
| ---: | --- |
| 11 | Announce Check tests the announcement contract for one critical browser flow. |
| 11 | It drives Chromium and records focus semantics and ARIA live-region changes. |
| 13 | It compares them with a checked-in transcript and writes a local HTML report. |
| 15 | It is for small web teams checking a signup, search, or form flow before release. |
| 10 | Announce Check observes browser accessibility semantics and ARIA live-region changes. |
| 11 | It does not emulate NVDA, VoiceOver, JAWS, or certify WCAG conformance. |
| 10 | Keep a short manual screen-reader check in your release process. |
| 8 | The npm registry entry is not published yet. |
| 9 | Install the tested versioned tarball from the documentation site. |
| 11 | The factory can publish the same tarball to npm after release approval. |
| 14 | It loads an approved signup transcript and a changed received transcript in one click. |
| 9 | Edit either input to see the first changed event. |
| 5 | Reset restores the bundled sample. |
| 10 | The guide and playground work offline after one online visit. |
| 15 | The demo stores no cookies or personal browser data and sends no third-party runtime requests. |
| 10 | Record the first local contract, review it, and check it in. |
| 5 | Then verify it in CI. |
| 9 | The command exits 0 on a match or update. |
| 16 | It exits 1 on a transcript difference and 2 for invalid input or a browser failure. |
| 7 | It writes announce-check-report/index.html by default. |
| 6 | --json writes one result to stdout. |
| 7 | Use --report directory to move the report. |
| 5 | Use --no-report to skip it. |
| 5 | Loopback URLs work by default. |
| 7 | A remote staging URL requires allowRemote: true. |
| 12 | Only test a remote system you own or are authorized to test. |
| 12 | Announce Check redacts filled values from events, console output, JSON, and reports. |
| 8 | The package ships ESM, CommonJS, and TypeScript declarations. |
| 9 | Its public API is defineConfig, runCheck, compareTranscripts, and renderReport. |
| 14 | npm run build produces the publishable library and the static site at dist/site/. |
| 8 | The versioned download is in dist/site/downloads/. |
| 9 | Run the site locally with npm run dev:site. |
| 14 | The project has no telemetry, accounts, cookies, remote fixture storage, or third-party runtime assets. |
| 7 | Reports and transcripts stay on your machine. |
| 5 | MIT © 2026 Sociobot (Param Factory). |

README headings and supported-step bullets are labels/fragments rather than sentences. `CI` in the README line is flagged by F-1-4/F-1-6; no other sentence needs a length or banned-word rewrite.

## Demo, privacy, and sandbox checks

- The required one-click path exists. The home action opened `/demo/` and its first rendered result already showed realistic expected and received signup transcripts, with **“First difference at event 3.”**
- The persistent banner read **“Demo — sample data, nothing is saved”** and contained Reset demo and Start for real. After replacing the received input, Reset restored the bundled changed signup transcript.
- A fresh 390 px context recorded only same-origin document, JS, CSS, image, and demo requests. It had no cookies, localStorage, sessionStorage, or IndexedDB databases. The service worker's public offline cache contains shipped assets only; no demo input is written to it.
- No missed AI, import/export, or sync feature is implied by the brief. An AI feature would be decorative for this deterministic browser-transcript CLI.

## Claims from a clean clone

I cloned the repository into a new temporary directory, ran `npm ci`, then ran each exact command in `.factory/claims.json`. All passed.

| Claim id | Result |
| --- | --- |
| demo-first-difference | PASS |
| local-private-flow | PASS |
| site-no-tracking | PASS |
| offline-demo | PASS |
| download-package | PASS |
| cli-exit-codes | PASS |
| origin-boundary | PASS |
| workflow-steps | PASS |
| package-formats | PASS |
| mit-license | PASS |

`npm test`, `npm run lint`, and `npm run build` also passed locally. The production build produced `dist/`, including the versioned tarball. The full claim test, mobile Axe scan, desktop check, and reduced-motion check reported no serious or critical accessibility violations. All crawled public/internal links and the GitHub Source link returned HTTP 200; a deliberate missing route returned the styled 404 with HTTP 404. The live home and demo emitted no console or page errors. The unavoidable browser console network error on the deliberate HTTP-404 response was observed only for that missing route.

## History check

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files in this checkout. I read the existing handoff and independently rechecked its prior repaired areas on the live site and in code: direct demo loading, populated sample state, Reset, privacy storage isolation, claims manifest, offline worker, download URL, mobile layout, and the designed 404 all work. No earlier finding id exists to carry forward.

## What would make this perfect

Fix F-1-1 first, then complete route metadata and the standard footer. Replace the state-noun controls and unexplained CI/contract wording with the proposed plain text, and either prove the CI promise with a manifest claim or remove it. After those changes, repeat the clean-clone claims, route-focus, metadata, footer, mobile, and copy checks from scratch.
