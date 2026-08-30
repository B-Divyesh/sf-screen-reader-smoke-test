# Adversarial review 3 handoff — FAIL

Date: 2026-08-30 UTC
Work order: `screen-reader-smoke-test-review-3`
Candidate and live content: `b7f952dbd8418214808a2ca8d55d941d1f28ab6e`

No product code was modified. The complete report is
`.factory/review-3.md`.

## What was done

- Cold-reviewed production in fresh 390 × 844 and desktop contexts.
- Audited every landing and README sentence, plus headings and controls.
- Exercised the one-click demo, matching, invalid input, Reset, focus,
  storage isolation, same-origin requests, and live offline reload.
- Ran all 14 exact claims from a clean local clone.
- Rechecked every finding from reviews 1 and 2 against production and source.
- Crawled links and checked routes, metadata, headers, 404, responsive layout,
  keyboard behavior, Axe, visual identity, and missed leverage.
- Ran the full test, lint, build, pack, and diff gates in the clean clone.

## Verification result

- All declared claim commands passed.
- `npm test` passed 8 files / 28 tests; lint, build, pack dry run, and diff check
  passed.
- Live Axe reported zero violations on all routes at mobile and desktop.
- `/opt/fleet/lib/verify-url.sh` passed with no console errors.
- Live and local package SHA-256 matched.
- Verdict remains **FAIL** because F-1-1 regressed. Internal navigation and
  Back leave focus on `body` and do not announce the destination heading.

## Remaining work

1. Restore route-heading focus/announcement only after internal navigation and
   Back/Forward; retain the cold-load first-Tab skip-link order.
2. Add target/browser-failure coverage to the `cli-exit-codes` claim or narrow
   the public exit-code wording.
3. Standardize demo/privacy terminology and regenerate the exact copy audit.
