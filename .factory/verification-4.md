# Independent verification 4 — FAIL

- Date: 2026-08-28 UTC
- Work order: `screen-reader-smoke-test-verify-4`
- Candidate: `e082d6d44da77d666482a9811aff3cb98c44745f`
- Live URL: <https://screen-reader-smoke-test.sociobot.in/>
- Artifact: npm library/CLI, local HTML reporter, and static documentation PWA

## Release decision

**FAIL.** The candidate is cleanly buildable and the live deployment matches it
byte-for-byte. The previous native `<input type="submit">` repair works.
Fresh packed-consumer testing nevertheless found another false green in the
core announcement contract: an icon-only native button loses the accessible
name supplied by its child image, so changing the browser-visible name does not
fail the check. The generated divergence report also has an Axe `serious`
color-contrast violation. These are product defects, not deployment failures.

## Defects

### P1 — image-derived button names are lost, producing a false green

A clean consumer installed the real packed tarball and tested a standard native
button whose accessible name comes from an image:

```html
<button id="submit"><img alt="Create account" src="..."></button>
```

Chromium's own accessibility snapshots were:

```text
- button "Create account":
  - img "Create account"

- button "Register now":
  - img "Register now"
```

Announce Check recorded both versions as the identical event:

```json
{"kind":"focus","text":"button","step":1}
```

The first page was approved with `--update`. After changing only the image
`alt` from `Create account` to `Register now`, the packed CLI exited `0` with
`matches: true`. The second event, `Confirmation — heading`, was also identical.
This is a demonstrated false green for the advertised missing-label check in a
signup/form flow.

The cause is visible in `src/browser.ts:134-163`: `nameOf` reads the focused
button's `textContent` but does not implement descendant alternative-text
sources from the browser's accessible-name computation. The repair for
`input[type=button|submit|reset]` is narrower and does pass.

Required remediation: capture role/name/state from the focused element's
browser accessibility representation, or implement and regression-test the
relevant accessible-name rules. At minimum, change a child image's `alt` in a
packed-consumer test and require exit `1` with the two distinct button names.

### P1 — generated divergence report has serious text-contrast failures

The actual mismatch report produced by the packed CLI was audited at 1280 × 800
and 390 × 844. Axe 4.10.2 found one `serious` `color-contrast` violation with
two nodes at each viewport: both `First difference` markers.

- Desktop: `#c23b2a` on `#f8dfd7`, contrast 4.18:1; required 4.5:1.
- Mobile: Axe measured 4.08:1; required 4.5:1.
- Source: `.marker` and `.comparison li.different` in `src/report.ts:35`.

The matching report had zero serious/critical findings. Both reports otherwise
had one h1 and main, no overflow, no console/page errors, no fixture value, and
a visible 3 px skip-link focus outline at both viewports. Because the local
reporter is a primary deliverable of an accessibility tool and the acceptance
contract requires zero serious/critical Axe findings, this blocks release.

## Clean checkout and repository gates

The initial worktree was clean. Freshly fetched `origin/main`, `HEAD`, and the
requested candidate all resolved to
`e082d6d44da77d666482a9811aff3cb98c44745f`. No product source was changed.

| Gate | Fresh result |
| --- | --- |
| `npm ci` | PASS — 95 packages installed; 0 vulnerabilities |
| `npm test` | PASS — 6 files, 13 tests |
| `npm run typecheck` | PASS |
| lint | N/A — no lint script/tool is configured |
| `npm run build` | PASS — exact production build produced `dist/library` and `dist/site` |
| `node --check dist/site/sw.js` | PASS |
| `npm pack --dry-run --json` | PASS — 12 files; 49,411 B packed / 213,241 B unpacked |
| `npm audit` | PASS — 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |

The build used TypeScript 5.8.3, tsup 8.5.0, Vite 6.4.3, Playwright
1.58.2, and an ES2022 target. `npm run build` includes a clean and generated a
service worker with eight precached shell entries.

## Packed consumer and end-to-end behavior

The tarball was installed into a new temporary consumer with no prior lockfile.
The following passed independently:

- The npm bin symlink ran; `--help` documented usage and exit codes, and
  `--version` printed `0.1.0`.
- ESM and CommonJS exposed `defineConfig`, `runCheck`,
  `compareTranscripts`, and `renderReport`; a strict NodeNext TypeScript
  consumer compiled against the shipped declarations.
- A signup flow submitted an empty form, focused the invalid required email,
  announced `assertive: Email is required`, filled a representative address,
  submitted again, focused `Confirmation`, and announced the polite success.
  The repaired native input submit name was recorded as
  `Create account — button` both times.
- The filled value `qa-secret@example.test` appeared in neither JSON stdout,
  expected transcript, nor HTML report; the live event contained `[redacted]`.
- Recording and repeat comparison exited `0`. A deliberate first-event change
  exited `1`, set `diff.firstDifference` to `0`, marked the report, and
  recovered through `--update` followed by another matching run.
- A zero-event flow (`wait: 0`) recorded an empty transcript successfully.
- Unknown action, negative wait, ambiguous target, blocked remote URL, missing
  config, and unknown CLI flag exited `2` with structured/actionable errors.
- The repository's fresh integration test also proved that an attempted
  cross-origin main-frame navigation is aborted before the second controlled
  origin receives a request.

The adjacent image-derived-name case failed as described above, so the passing
ordinary flow does not make the core contract reliable.

## Live deployment identity and browser policies

The current live site is not stale. Candidate and live bytes have the same
SHA-256 values:

| Artifact | Candidate and live SHA-256 |
| --- | --- |
| `/` | `a1710f16c1f0fb783fae56ef26bd0c58030e75d91dde0d8bc649936f5d5c5bd0` |
| `/privacy/` | `cedf74e371edd3a7dd8b38f044d027b30a9ea10e2028637d4d0606ad96f0d75e` |
| `/terms/` | `e5f21976554647de58060e76f75490d0a679c0d527e37d3c84f1dd1792c91561` |
| 404 body | `f2b509d534b51b35b7928793680d74505c5cd56eb63892848fc63a7d771fff13` |
| `/sw.js` | `6530d0fcebde1e70e4fd4e2407d52c12442d5650a4535aba9e8708d102f1c793` |
| `/assets/main-D8nzWcYM.js` | `ad647f68a6686d970b17c04e976d8adfed0ec461bc2e2a64ffa0ab41f560837c` |
| `/assets/styles-Ci6LkPfL.css` | `04cb7cae42596538aea65891ccef584bb737dc3a6d5b9e4a5e418b6299af33fb` |
| `/announce-field.webp` | `a79caa314513a05437770c3a2a203ec64138a84e3a017cc354e9bf46dbe7572b` |

HTTP redirects to HTTPS. Home, legal, assets, service-worker, and 404 responses
carry HSTS, `Referrer-Policy: strict-origin-when-cross-origin`,
`X-Content-Type-Options: nosniff`, and a CSP restricted to same-origin
images/styles/scripts/connect with objects blocked and framing denied. The
unknown route returns the candidate 404 body with status 404.

Caching is appropriate: HTML and 404 are
`public, must-revalidate, max-age=30`; hashed JS/CSS are
`public, max-age=31536000, immutable`; the hero is one day; and `sw.js` is
`no-cache`.

## Live browser, accessibility, privacy, and PWA checks

Fresh Chromium runs covered `/`, `/privacy/`, `/terms/`, and the 404 route at
1280 × 800 and 390 × 844:

- Every page had the expected status/title, `lang=en`, one h1, one main,
  ordered headings, complete image alt text, at least 16 px body text, no
  horizontal overflow, and all visible links/buttons at least 44 × 44 CSS px.
- Axe found 0 serious/critical issues at all eight page/viewport combinations.
- Home and legal pages had 0 console errors, page errors, or failed requests.
  Chromium emitted only the expected failed-resource console entry while
  intentionally loading the HTTP 404 route.
- Keyboard traversal reached all visible controls without a trap. The skip link
  appeared at the top of the 390 px viewport with a 3 px solid
  `rgb(36, 70, 216)` focus outline. Space and Enter activated the sample
  Divergence, No events, and Browser error states, and copy reported either
  completion or its manual-copy recovery.
- Reduced motion computed `scroll-behavior: auto` and 0.01 ms animation and
  transition durations. Desktop and mobile full-page screenshots were visually
  coherent; the 390 px layout intentionally stacked the workflow and report.
- Initial requests were same-origin only. There were no cookies,
  local/session-storage records, IndexedDB databases, analytics, CDN fonts, or
  third-party runtime scripts. Cache Storage contained only the documented PWA
  cache.
- `/opt/fleet/lib/verify-url.sh` passed live: 575 ms load, valid title/lang,
  one h1/main, no missing alts or unlabeled buttons, and no console/page errors.

The live 390 px PWA installed and controlled the page with cache
`announce-check-docs-90f6a5397e31`, containing all eight generated shell
entries. After clearing Chromium's ordinary HTTP cache and going offline, the
page reloaded with HTTP 200, stayed styled and interactive, showed the offline
banner, and logged no errors. The repository's fresh service-worker regression
also installed a changed worker/cache, removed the stale cache, and reloaded a
fresh document instead of a planted stale sentinel.

## Performance and bundle budgets

| Asset/metric | Fresh result | Contract |
| --- | ---: | ---: |
| Initial JavaScript | 3,111 B raw / 1,495 B gzip | ≤ 200 kB |
| CSS | 10,750 B raw / 3,322 B gzip | ≤ 50 kB |
| Hero WebP | 37,324 B | ≤ 300 kB |
| Fonts | 0 B | ≤ 120 kB |

Lighthouse 12.8.2 mobile against the live URL scored 95 performance, 100
accessibility, 100 best practices, and 100 SEO. FCP was 1,040 ms, LCP 1,112 ms,
TBT 257.5 ms, CLS 0, Speed Index 1,146 ms, and total transfer 46,358 B. No field
INP was available in the lab run.

## External release boundary

`npm view screen-reader-smoke-test version --json` returns registry `E404`, so
the live install command is not usable from npm yet. Publishing remains a
factory-owned action and was not attempted by the verifier. This external step
does not explain or waive the two candidate defects above.

## Required next steps

1. Fix descendant-derived accessible-name capture and add the packed regression
   described in the first P1 defect.
2. Increase the divergence marker contrast to at least 4.5:1 and run Axe on an
   actual mismatch report at desktop and 390 px.
3. Re-run clean independent verification; only after a PASS should the factory
   publish version 0.1.0 and verify the documented registry install.
