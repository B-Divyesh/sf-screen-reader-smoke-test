# Independent verification 7 — FAIL

Date: 2026-08-30 UTC
Candidate: `59b0f79f049f74019c8552ed0be54588be497f85`
Live URL: <https://screen-reader-smoke-test.sociobot.in/>

## Release decision

**FAIL.** A cold page load moves focus to the `h1`. That places focus after the
header in DOM order: first forward Tab goes to “Try it with sample data,” not
the required skip link, brand, or primary navigation. The skip link exists but
is not available in the normal initial forward-tab path.

## Defects

1. **P1 — cold loads bypass the skip link and header for keyboard users.**
   - Reproduced on the live root page at 1280×800 and 390×844.
   - On load, `document.activeElement` is `h1#hero-title`, because
     `site/route.ts` calls `heading.focus()` from `pageshow`.
   - The first seven forward Tabs are the sample-data link, install command,
     copy button, configuration code, and report-state controls. The skip link
     and header precede the focused heading and require reverse tabbing or
     cycling through the page.
   - Restrict heading focus/announcement to actual route changes, not an
     initial document load. Add a fresh-page first-Tab regression; do not
     programmatically focus `.skip-link` in that test.

2. **P2 — Reset demo initially hides its focused input behind the sticky
   banner under normal motion preferences.**
   - At 390×844, invalid input → Compare → Reset immediately focused
     `#expected-input` at `top: -152px`, `bottom: 50px`; the banner covered
     `0–108px`. It became visible only after smooth scroll completed, around
     1.1 seconds later.
   - Scroll instantly before focus (or allow focus to scroll) and test the
     normal-motion mobile case immediately after activation.

## Required gates and claims

The candidate was checked out cleanly at
`/tmp/announce-check-verify-7-clean`. `npm ci` installed 95 packages with zero
reported vulnerabilities. Every command in `.factory/claims.json` was run
using its exact `npm test -- --testNamePattern @claim:<id>` entry; all 14
passed: `demo-first-difference`, `local-private-flow`, `site-no-tracking`,
`offline-demo`, `download-package`, `cli-exit-codes`, `ci-recheck`,
`cli-output-modes`, `build-artifacts`, `local-site`, `origin-boundary`,
`workflow-steps`, `package-formats`, and `mit-license`.

The clean-worktree `npm test` passed **8 files / 27 tests** in 67.40 seconds.
It covers the demo, privacy requests/storage, offline reload, packed consumer,
CLI modes/exit codes, workflow, origin boundary, and accessibility. The
candidate checkout also passed `npm run lint`, `npm run typecheck`, `npm run
build`, `npm pack --dry-run --json --ignore-scripts`, and `git diff --check`.
The build created `dist/library` and `dist/site`; the package has 12 files and
is 51,943 bytes packed. A clean consumer installed the tarball successfully;
CLI help/version plus ESM and CommonJS API imports worked.

## Live evidence

### First read and product flow

The cold page says it catches changed keyboard focus and status messages, names
small web teams checking one critical form flow before release, and offers
“Try it with sample data” with the adjacent plain explanation that it loads a
sample event list and shows its first change. The first-read and one-click demo
requirements pass.

At desktop and 390px, `/?demo=1` redirected to `/demo/?demo=1`, showed the
sample-data banner, identified the first difference, recovered from malformed
event-list input, and reset the sample. Axe reported **0 serious and 0
critical** findings at both sizes; there were no console/page errors and no
horizontal overflow. Reduced motion computes 0.01 ms animation/transition
durations and `scroll-behavior: auto`.

### Privacy, offline, and deployment

The complete demo request log contained only the product origin; there were no
third-party runtime requests, cookies, localStorage, sessionStorage, or
IndexedDB databases. With service-worker control, offline reload of the demo
returned HTTP 200, retained the demo/offline banners, and logged no error.
There is no sign-in or product API, so Entra and request-allowance/429 checks
are not applicable.

Fresh SHA-256 comparisons matched local candidate and production bytes for
the HTML routes, 404 page, service worker, loaded hashed JS/CSS, and versioned
tarball. The live site therefore matches `59b0f79`. Live HTML responses have a
self-only CSP with `frame-ancestors 'none'`, `nosniff`, and strict-origin
referrer policy. Hashed assets are immutable for one year; `sw.js` is
no-cache. Built gzip sizes are 1.19 kB per route JavaScript chunk and 4.01 kB
for CSS, within budget.

## Handoff

No product code was modified. Fix the P1 cold-load focus order, correct the P2
mobile reset focus visibility, then rerun the full claims suite and independent
live keyboard check.
