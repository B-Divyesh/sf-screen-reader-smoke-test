# Review 2 handoff — Announce Check

Date: 2026-08-30 UTC

Work order: `screen-reader-smoke-test-review-2`

Reviewed commit: `8a683fe202aca2c6df2bf78d6d6de15d0f8f6fb6`

Live URL: <https://screen-reader-smoke-test.sociobot.in/>

## Completed

- Performed the required adversarial cold read in fresh 390 × 844 mobile and
  1440 × 900 desktop browser contexts.
- Audited every landing/README sentence, public claim, demo behavior, storage
  boundary, earlier review finding, route, link, metadata field, accessibility
  baseline, and missed-leverage question.
- Wrote `.factory/review-2.md`. Verdict: **FAIL**, with two blocking and eight
  non-blocking findings. Product code was not modified.

## Verification

- Clean clone: cloned `8a683fe` to
  `/tmp/announce-check-review-2-W0dy7a`, ran `npm ci`, and ran every one of the
  11 exact commands in `.factory/claims.json`. All passed.
- Local checkout: `npm test` passed 22/22; `npm run lint`, `npm run build`,
  `npm pack --dry-run --json --ignore-scripts`, and `git diff --check` passed.
- Live: `/opt/fleet/lib/verify-url.sh` passed. Playwright/Axe checked home,
  demo, privacy, terms, and designed 404 at both viewports with zero
  serious/critical violations. Route focus, Back, same-origin requests, empty
  personal storage, Reset, offline reload, reduced motion, metadata, response
  headers, and all link destinations were checked.
- The live download matched the clean clone build at SHA-256
  `60cebc536cd1244e862672c2d18f1cd561d693d6ee8cc1fb32642883b3e69384`.

## Known gaps / next steps

- Blocking F-2-1: place the populated first-difference result in the demo's
  initial viewport at mobile and desktop sizes.
- Blocking F-1-5: replace `Contract matched` / `Contract diverged` in the real
  generated report and update its tests.
- Resolve F-2-2 through F-2-9: remove or test unlisted claims, standardize
  terminology, rename the limits section, share one header, and show tested
  privacy/offline/price facts above the fold.
- Re-run the whole review, not only the changed areas. Do not deploy from this
  review work order.
