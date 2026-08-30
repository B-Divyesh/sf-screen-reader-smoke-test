# Repair handoff — local verification PASS

Date: 2026-08-30 UTC
Work order: `screen-reader-smoke-test-repair-6`
Base: `34e3c4d71e32bc74d3fa598a0a91c114bb3d02a7`
Product: Announce Check (`library-npm` with static documentation/demo site)

## Reproduced verifier failures

Before the repair, a fresh page at both 1280 × 800 and 390 × 844 had
`h1#hero-title` as `document.activeElement`; the first forward Tab landed on
“Try it with sample data,” bypassing the skip link and header. At 390 × 844
with normal motion, invalid input → Compare → Reset focused
`#expected-input` while it was at `top: -152.23px`, beneath the sticky demo
banner (`0–107.58px`).

## Repair

- Removed the `pageshow` heading-focus/route-announcement script. These are
  full-document navigations, so the browser exposes the new title and document
  normally; initial keyboard focus now remains at the document start.
- Made each skip target `<main tabindex="-1">`, so Enter on the first Tab
  destination moves focus to the main landmark.
- Reset now calculates the sticky banner’s visible area, performs an immediate
  scroll, then focuses the expected-event textarea with `preventScroll`.
- Replaced the false-positive heading-focus assertions with exact browser
  regressions: fresh 1280 × 800 and 390 × 844 pages must Tab to the visible
  skip link, then the home brand and Demo header link; the 390px normal-motion
  Reset flow must immediately keep the focused textarea fully below the
  banner.

## Verification

- `npm ci` — PASS; 95 packages installed; audit reported 0 vulnerabilities.
- `npm test` — PASS; 8 files, 28 tests, 46.50 s. This includes desktop and
  390px Axe checks (zero serious/critical findings), keyboard traversal,
  privacy request/storage checks, offline reload and worker-update coverage,
  and a clean packed-package consumer for CLI, ESM, CommonJS, and declarations.
- Every one of the 14 exact commands in `.factory/claims.json` — PASS.
- `npm run lint`, `npm run typecheck`, `npm run build`, and
  `node --check dist/site/sw.js` — PASS.
- `npm pack --dry-run --json --ignore-scripts` — PASS; 12 files, 51,943 B
  packed / 222,832 B unpacked.
- `npm audit`, `npm audit --omit=dev`, and `git diff --check` — PASS.
- Production output: CSS 14.51 kB raw / 3.95 kB gzip; the initial home JS is
  3.24 kB raw across its two small files. Both are within the static-product
  budgets.

## Deployment and live identity

Code repair `7e6cd05afa29115e141f1ee79cd89ce26e159eda` and handoff/coverage
commit `9bc991a3dc832775d06f5af1a53ff5314eb68b00` were pushed to `origin/main`;
`git ls-remote` confirms that `origin/main` is at the latter commit. Repeated
identity polls over several minutes still received the previous static
deployment: its root SHA-256 was
`0ac3b208c55f99fbb6c3d10b7f5feb759942f32f1ae3490391b9c6b0b351c1bc`,
while this build is
`2aa76234c9d795bc12641906b09351912a252d8c71c7c6f7bc839a65702145d3`.

The required `verify-url.sh` check passes against the currently served (old)
site in 559 ms with zero console errors, a title/lang/main, one h1, no missing
alt text, and no unlabeled buttons. That result is deliberately not credited to
the candidate: the old page still contains the removed route announcer. Its
response policy is healthy (self-only CSP with `frame-ancestors 'none'`, HSTS,
`nosniff`, strict-origin referrer policy, HTML must-revalidate caching, and
`sw.js` no-cache). Re-run the live desktop/mobile keyboard, Axe, offline,
response-policy, and byte-identity checks after the static deployment completes.

## Known gaps / next step

No local product or quality-gate gaps remain. The only outstanding external
step is the factory static deployment serving the pushed repair; no deployment
token or deployment configuration is present in this repository. Follow it
with the live identity checks above. npm registry publication remains
factory-owned and is intentionally not performed by this work order.
