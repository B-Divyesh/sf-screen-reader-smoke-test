# Polish 2 handoff — Announce Check

Date: 2026-08-30 UTC

Work order: `screen-reader-smoke-test-polish-2`

Base review commit: `5943d87345db41dd36a3e3084ca4a13948afab9b`

Repair commit deployed: `7b842899fa04c4dc2c131b4a78a17f6f4ac0c23f`
Live URL: <https://screen-reader-smoke-test.sociobot.in/>

## Completed

- Resolved every finding in `.factory/review-1.md` and `.factory/review-2.md`; the detailed id-to-change mapping is in `.factory/polish-2.md`.
- Moved the real, populated demo result above the editors. `?demo=1` redirects to its isolated sample page, shows the persistent banner, resets bundled sample data, and never writes personal browser storage.
- Repaired the real generated CLI report language, added three missing claims with observable tests, removed untestable release/process promises, and rewrote public copy around one term: “event list.”
- Made the primary header route-consistent, retained destination focus/live announcements and complete route metadata/404, and made tested privacy, offline, and MIT facts fit above the fold.
- Preserved the original warm-paper, cobalt-geometry visual system; no external fonts, scripts, analytics, or runtime services were added.

## How verified

- Fresh clone `/tmp/announce-check-polish-2-X6evwW` at `7b84289`: ran `npm ci`, then all 14 exact claim commands from `.factory/claims.json` independently. Every command passed, including fresh packed-consumer output modes, build artifacts, and the documented local dev server.
- Full suite: `npm test` passed (25 tests). `npm run lint`, `npm run build`, `npm pack --dry-run --json --ignore-scripts`, and `git diff --check` passed.
- Browser/accessibility: local Playwright covers desktop/mobile keyboard operation, focus, responsive bounds, storage/privacy, service-worker offline reload, console errors, and Axe. The live cold pass recorded zero serious/critical Axe issues on `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`, and `/missing-polish-2`.
- Production deployment: `/opt/fleet/lib/deploy-static.sh screen-reader-smoke-test dist/site` succeeded as deployment `9b39c7f8-7326-44a6-9912-b77509c02a31`. `/opt/fleet/lib/verify-url.sh` passed in `artifacts/polish-2-live/verify.json` (895 ms cold load, no console errors).
- Live evidence: `artifacts/polish-2-live/live-check.json` records shared headers, titles, 404 status, focus, reset, empty personal storage, same-origin requests, and offline demo reload. `artifacts/polish-2-live/demo-mobile.png` shows both changed sample status messages above the first mobile fold.

## Run and publish

```sh
npm ci
npm test
npm run lint
npm run build
npm pack
```

`npm pack` produces the ready-to-publish npm tarball; publishing remains a factory-owned registry action.

## Known gaps

None. The deliberate missing-route check produces the browser’s expected failed-resource console message because its HTTP response is correctly 404; normal product routes are console-clean.
