# Polish 3 handoff — Announce Check

Date: 2026-08-30 UTC

Work order: `screen-reader-smoke-test-polish-3`

Candidate: `cae2c69b4836aaf7d317e70f35f485b8274d5387`

Deployed code commit: `90122f79f6079df0f2a33e1d90e0a4377cd5f93a`

Live URL: <https://screen-reader-smoke-test.sociobot.in/>

## Completed

- Re-audited every finding in `.factory/review-1.md`,
  `.factory/review-2.md`, `.factory/polish-1.md`, and
  `.factory/polish-2.md`. The cited review commit contains review 2; no
  `.factory/review-3.md` exists in that commit, the candidate, or reachable
  history. The cumulative mapping is in `.factory/polish-3.md`.
- Replaced per-test/brittle Vite startup with one globalSetup server, 60-second
  HTTP readiness polling, shared origin injection, and one globalTeardown.
- Strengthened direct `?demo=1`, sample reset, privacy, mobile first-screen,
  exact route metadata, shared header/footer, focus announcement, legal-link,
  sitemap, and deployment-404 regressions.
- Added a manifest integrity test so each of 14 claims has exactly one known
  tagged test. Updated claim terminology and the verb-first 80-character
  catalog description.
- During the final cold visual pass, fixed Reset focus being partly covered by
  the sticky mobile banner, added a regression, redeployed, and rechecked.
- Preserved the warm-paper, cobalt construction-line, editorial-serif and
  monospaced instrument identity. The artifact remains an npm library with
  ESM, CommonJS, declarations, CLI, tarball, and static documentation site.

## Verification

- Final clean clone: `/tmp/announce-check-polish-3-final-Ws56dI` at `90122f7`.
  `npm ci` reported 0 vulnerabilities. All 14 exact claim commands passed.
- Full clean-clone suite: `npm test` passed 27/27 across unit, packed-consumer,
  browser, accessibility, privacy, offline, routing, and build tests.
- `npm run lint`, `npm run build`,
  `npm pack --dry-run --json --ignore-scripts`, and `git diff --check` passed.
  The package dry-run contains 12 files and is 51.9 kB.
- The deterministic harness passed three consecutive full runs (49.45 s,
  48.93 s, 49.46 s); every teardown check found no remaining Vite process.
  The previous false timeout was reproduced with HTTP ready and its stdout
  readiness marker absent after 15 seconds.
- Final deployment `3e0c1171-be51-412a-90f2-6ca96e851248` succeeded. The
  factory URL verifier passed at 552 ms with no console errors.
- Cold live Playwright/Axe checks passed `/`, `/demo/`, `/privacy/`, `/terms/`,
  and a real HTTP-404 route at desktop and mobile. Direct demo isolation,
  reset/focus visibility, same-origin requests, empty personal storage,
  offline reload, legal links, exact titles/canonicals/social metadata,
  security headers, and forward/Back focus all passed.
- Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.1 s, CLS 0, TBT 30 ms, total transfer 46 KiB.
- Built budgets: initial home JS 1.69 kB gzip, demo JS 1.69 kB gzip, shared CSS
  4.01 kB gzip, hero 37 kB. The local/live tarballs share SHA-256
  `2924e0837edd70b7b51f6d35aaa4c0af44673f792c60dd5ab91d2d2b0e5c23c3`.

Evidence:

- `.factory/polish-3.md`
- `artifacts/polish-3-local/clean-clone-verification.txt`
- `artifacts/polish-3-local/harness-reproduction.txt`
- `artifacts/polish-3-local/repeated-suite-runs.txt`
- `artifacts/polish-3-live/live-check.json`
- `artifacts/polish-3-live/verify.json`
- `artifacts/polish-3-live/lighthouse.json`
- `artifacts/polish-3-live/home-mobile.png`
- `artifacts/polish-3-live/demo-mobile.png`
- `artifacts/polish-3-live/404-mobile.png`

## Run and package

```sh
npm ci
npm test
npm run lint
npm run build
npm pack
```

The factory owns registry publication. No package was published from this work
order.

## Known gaps

None.
