# Independent verification 8 — PASS

Date: 2026-08-30 UTC
Candidate and deployed commit: `839f30b8fbb008fedf8500fe44605360a9e0f2dd`
Live URL: <https://screen-reader-smoke-test.sociobot.in/>

## Release decision

**PASS.** The live deployment is the candidate byte-for-byte and it meets the
brief's local, reviewable announcement-contract job: a small web team can
record a short authorized browser flow, compare the saved event list, and see
the first difference without sending form values away.

## Cold first read

On a fresh production load, the first screen says: “Catch changed keyboard
focus and status messages.” It says it is for “small web teams checking one
critical form flow before release,” and the visible primary action is “Try it
with sample data,” immediately explained as loading a sample event list and
showing its first change. The three plain facts state redaction, offline
behavior, and MIT price. This satisfies the what/who/first-action requirement.

## Required claims

`npm ci` installed 95 locked packages with 0 reported vulnerabilities. Every
exact command in `.factory/claims.json` passed from this clean checkout:

| Claim IDs passed |
| --- |
| `demo-first-difference`, `local-private-flow`, `site-no-tracking`, `offline-demo`, `download-package`, `cli-exit-codes`, `ci-recheck` |
| `cli-output-modes`, `build-artifacts`, `local-site`, `origin-boundary`, `workflow-steps`, `package-formats`, `mit-license` |

The five package claims deliberately share one full isolated packed-consumer
test; each manifest command was nevertheless invoked separately and passed.

## Local product and package gates

- `npm test` — PASS: 8 files, 28 tests, 64.80 s.
- `npm run lint` and `npm run typecheck` — PASS.
- `npm run build` — PASS. It produced `dist/library` and `dist/site`.
- `npm pack --dry-run --json --ignore-scripts` — PASS: 12 files, 51,943 B
  packed and 222,832 B unpacked.
- A separately packed tarball installed in a clean temporary Node consumer.
  ESM `defineConfig`, `compareTranscripts`, and `renderReport`, CommonJS
  exports, and `announce-check --version` all worked.
- `git diff --check` — PASS.

The built initial home JavaScript is 1.22 kB gzip (plus a 0.40 kB module
polyfill); demo JavaScript is 1.31 kB gzip; CSS is 3.95 kB gzip. All are well
within the stated static-product budget.

## Live checks

- Candidate identity: SHA-256 matched local build and production for root,
  demo, privacy, terms, 404, service worker, loaded JS/CSS, and the versioned
  package download. Root hash: `2aa76234c9d795bc12641906b09351912a252d8c71c7c6f7bc839a65702145d3`.
- Desktop (1280×800) and mobile (390×844): no horizontal overflow; the first
  Tab reaches a visible “Skip to main content” link and Enter focuses `main`.
  The one-click `/?demo=1` entry redirects to the populated canonical demo.
  A normal mismatch is shown; malformed input reports “Event list format needs
  attention”; Reset restores the data and focuses a fully visible input.
- Axe on landing and demo at both viewports: **0 serious, 0 critical**. There
  were no page errors or console errors. `lang`, title, one h1, main landmark,
  labels, and image alt text were present. Captured screenshots are in
  `artifacts/verification-8-live/`.
- Reduced motion computed `scroll-behavior: auto` and 0.00001 s transition /
  animation durations. Normal-motion reset deliberately scrolls instantly
  before focus, so the focused textarea remains visible below the sticky demo
  banner at 390 px.
- Privacy: the complete live demo request log contained only
  `https://screen-reader-smoke-test.sociobot.in`; cookies were empty and
  localStorage, sessionStorage, and IndexedDB were all empty. There is no
  sign-in or product API, so Entra and request-allowance/429 checks do not
  apply.
- Service worker: an active `/sw.js` registration had no waiting update;
  explicit `registration.update()` retained the active worker. After offline
  mode, demo reload returned 200 and retained both sample comparison and the
  offline banner with no errors.
- Response policy: HTML sends HSTS, `nosniff`, strict-origin referrer policy,
  and self-only CSP including `frame-ancestors 'none'`. Hashed JS/CSS use
  one-year immutable caching; `sw.js` is `no-cache`; HTML is
  `must-revalidate, max-age=30`. All internal links across root, demo, privacy,
  terms, and 404 returned 200; an unknown route returned the designed 404 with
  status 404.

`verify-url.sh` is not present in this repository, so its title/lang/main/alt/
console checks were independently performed with fresh Playwright contexts as
documented above.

## Defects

None found. No product code was modified during verification.
