# Review 1 handoff — Announce Check

Date: 2026-08-30 UTC
Work order: `screen-reader-smoke-test-review-1`

Completed an adversarial first-read review of the deployed product without changing product code. The committed review is `.factory/review-1.md`.

Verification performed:

- Fresh 390 px and desktop live-browser cold reads, keyboard navigation, demo entry, Reset, privacy request/storage inspection, route/back behavior, links, response headers, metadata, and designed 404.
- Exact claim commands from `.factory/claims.json` in a fresh temporary clone; all 10 passed.
- `npm test`, `npm run lint`, and `npm run build` passed. Mobile Axe scans of home, demo, legal pages, and 404 had no serious or critical violations.

Decision: **FAIL**. The review records one blocking route-focus/announcement failure and five further findings covering non-home metadata, footer/external-link contract, unlisted CI claims, control wording, and jargon. No product files were modified; only this handoff and the review were added.

Next step: repair `F-1-1` through `F-1-6`, then rerun the entire review from a fresh clone and fresh browser contexts.
