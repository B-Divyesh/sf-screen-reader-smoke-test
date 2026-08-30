# Polish 2 — cumulative finding resolution

Date: 2026-08-30 UTC

Base review: `.factory/review-2.md` at `5943d87345db41dd36a3e3084ca4a13948afab9b`

Repair: `7b842899fa04c4dc2c131b4a78a17f6f4ac0c23f`
Live URL: <https://screen-reader-smoke-test.sociobot.in/>

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept route-heading focus and polite route announcement behavior; the direct demo route remains `/?demo=1` → `/demo/?demo=1`. | `documentation site > moves focus to each route heading and announces the destination`; live `focus.rootFocus` and `focus.demoFocus` are true in `artifacts/polish-2-live/live-check.json`. |
| F-1-2 | Retained complete route-specific metadata, canonical URLs, OG/Twitter cards, and designed 404 metadata. | `release metadata > publishes route-specific social metadata...`; live route matrix in `artifacts/polish-2-live/live-check.json`. |
| F-1-3 | Retained the required version/build attribution and explicit external GitHub label in each footer. | Metadata/footer regression; live root verification in `artifacts/polish-2-live/verify.json`. |
| F-1-4 | Retained the automated-check claim and its non-interactive packed-consumer test. | Clean-clone `npm test -- --testNamePattern @claim:ci-recheck` passed. |
| F-1-5 | Replaced generated-report `Contract matched` / `Contract diverged` with `No differences found` / `First difference found`; tests reject both removed phrases. | `documented signup flow > @claim:local-private-flow...`; `test/runner.test.ts` rejects both old strings. |
| F-1-6 | Standardized first-read wording on “event list,” keyboard focus, and status messages; regenerated the copy audit. | `.factory/copy-audit.md`; local and live first-screen checks. |
| F-2-1 | Moved the populated first-difference summary before editors; it includes both changed status messages. | `@claim:demo-first-difference` asserts all summary bounds at 1280×800 and 390×844; [live mobile demo](../artifacts/polish-2-live/demo-mobile.png); live boxes end at y=768 of 844. |
| F-2-2 | Removed registry-status and future-publication promises from landing and README. | `rg` copy audit; clean-clone claims complete. |
| F-2-3 | Added `cli-output-modes` claim and a packed-consumer test for default report, JSON, custom report directory, and `--no-report`. | Clean-clone `npm test -- --testNamePattern @claim:cli-output-modes` passed. |
| F-2-4 | Added `build-artifacts` and `local-site` claims with tests for actual build outputs and a loopback `npm run dev:site` request. | Clean-clone `@claim:build-artifacts` and `@claim:local-site` commands passed. |
| F-2-5 | Removed the untestable future change-notice promise from Terms. | Source and live Terms review in `artifacts/polish-2-live/live-check.json`. |
| F-2-6 | Rewrote public first-read copy to use “event list” consistently; technical ARIA syntax remains only where needed. | `.factory/copy-audit.md`; live root/demo text check. |
| F-2-7 | Renamed navigation to `Limits` and the section heading to `What Announce Check can and cannot prove.` | Shared-header matrix test and live route matrix. |
| F-2-8 | Rendered one four-link header on home, demo, privacy, terms, and 404, with root-qualified section anchors. | `documentation site > has no serious accessibility violations...`; live route matrix shows identical names/destinations. |
| F-2-9 | Replaced duplicate locality facts with tested redaction, offline, and MIT-price facts; tightened hero wrapping so all fit above the fold. | `keeps the first action and tested privacy, offline, and price facts inside the first screen`; live 1440×900 facts end at y=864 and mobile facts at y=694. |

## Verification summary

- Fresh clone: `/tmp/announce-check-polish-2-X6evwW` at `7b84289`; `npm ci`, every exact command in `.factory/claims.json`, and `npm test` passed.
- Local: `npm run lint`, full `npm test`, `npm run build`, `npm pack --dry-run --json --ignore-scripts`, and `git diff --check` passed. Built initial JavaScript is 2.71 kB gzip (demo) and 2.48 kB gzip (home).
- Production: Static deployment `9b39c7f8-7326-44a6-9912-b77509c02a31` succeeded. `/opt/fleet/lib/verify-url.sh` passed; live Playwright/Axe found zero serious or critical violations on root, demo, privacy, terms, and the designed 404. The expected browser network message on the deliberate 404 is the only recorded console error.
