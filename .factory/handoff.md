# Repair 7 handoff — PASS

Date: 2026-09-05 UTC
Work order: `screen-reader-smoke-test-repair-7`
Live URL: <https://screen-reader-smoke-test.sociobot.in/>
Implementation SHA: `69d37616d7f72049a1aa6dd7c6b9800fec20af79`
Documentation SHA: the report-only commit containing this handoff; recorded in
the operator response after Git assigns it.

## What changed

- Restored a shared route announcer on every page. Direct visits and reloads
  keep focus on the document, so the first Tab reaches Skip. Internal links and
  Back/Forward focus the destination `h1` without scrolling and copy its text
  into a polite status region.
- Added an outcome-based browser regression at 1280 × 800 and 390 × 844. It
  proves cold-load Tab order, link navigation focus and announcement, and Back
  focus and announcement.
- Expanded the `cli-exit-codes` claim and packed-consumer test. Exit code 2 is
  now observed for invalid input, an unreachable target, and an unavailable
  Chromium installation.
- Standardized public wording on “demo,” replaced internal privacy jargon with
  concrete facts, and regenerated the exact README/landing copy inventory.
  New tests check every count, the complete README inventory, linked demo
  instruction, dynamic landing copy, and separate footer statements.
- Kept the one-click demo, reset behavior, offline shell, package API, privacy
  boundaries, and all earlier fixes unchanged.

## Finding disposition

| Finding | Result |
| --- | --- |
| F-1-1 route focus/announcement | **Fixed.** Cold load leaves `body` active; internal navigation and Back focus and announce the destination heading on desktop and phone. |
| F-3-1 exit-code claim coverage | **Fixed.** The claim now includes target/browser failures, and the installed packed CLI proves both with exit 2. |
| F-3-2 demo/privacy terminology | **Fixed.** Public copy uses “demo” consistently and names actual storage/request behavior. |
| F-3-3 copy audit accuracy | **Fixed.** Correct counts, linked instruction, footer boundaries, and source-synchronization tests are present. |
| Earlier F-1-2 through F-2-9 and verification defects | **Still fixed.** Full package, browser, Axe, offline, metadata, target-boundary, touch-target, and report tests pass. |

## Clean verification

Clean clone: `/tmp/announce-check-repair-7-clean-eKwOLY/repo`

- `npm ci` — PASS; 95 packages, 0 reported vulnerabilities.
- Every exact command in `.factory/claims.json` — PASS, all 14 claims.
- `npm test` — PASS, 9 files / 32 tests.
- `npm run lint` — PASS.
- `npm run build` — PASS; produced `dist/library` and `dist/site`.
- `npm pack --dry-run --json --ignore-scripts` — PASS; 12 files, 52,031 B.
- `git diff --check` — PASS.
- A fresh consumer installed the final HTTPS tarball. CLI help/version, ESM,
  CommonJS, declarations, and public functions loaded correctly.

The initial home JavaScript is 0.69 kB + 1.19 kB gzip, demo JavaScript is
0.69 kB + 1.28 kB gzip, and CSS is 4.01 kB gzip.

## Deployment and cold production checks

- Final deployment: `6081c906-f44c-446c-992c-1afbe0b90830` to the existing
  one-site static configuration.
- Local and live final package SHA-256:
  `f496ee5d30bd7c508faead12c69b818edd51846a4d3bef6ffee413e9d5e1b025`.
- `verify-url.sh` — PASS in 748 ms: no console errors; correct title/lang/main;
  one `h1`; no missing alt text or unlabeled buttons.
- Fresh 1280 × 800 and 390 × 844 contexts passed cold first-read, first-Tab
  Skip, internal navigation, Back, populated demo, matching edit, Reset focus,
  empty browser storage, and no console errors.
- Live Axe — 0 serious/critical violations on home, demo, privacy, terms, and
  the designed 404. All real links returned 200; the deliberate missing route
  returned the expected styled HTTP 404.
- Live offline reload returned 200 after clearing the browser HTTP cache. The
  offline banner and populated demo remained usable without errors.
- Lighthouse mobile — performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.1 s, CLS 0, TBT 30 ms, 47 KiB transfer.
- Evidence: `artifacts/repair-7-live/`.

## Known gaps and next steps

No product defect remains from the complete review and verification history.
This static library site has no backend, tenant state, sign-in, payment, or
rate-limited API, so persistence, tenant-isolation, and 429 checks do not
apply. The npm registry name remains an optional factory release step; the
documented versioned HTTPS package is the tested install path and is live.
