# Polish 1 handoff — Announce Check

Date: 2026-08-30 UTC
Work order: `screen-reader-smoke-test-polish-1`
Repair commit: `a1ab5b03ea09d61a3b249dd23ff720291c5aabff`
Deployment: `f5e1eadc-0831-4c52-9b58-c5c63c14a990` to <https://screen-reader-smoke-test.sociobot.in/>

## Completed

- Resolved all six findings in `.factory/review-1.md`; the detailed mapping is in `.factory/polish-1.md`.
- Added a `?demo=1` first-screen path. It redirects to the canonical isolated demo at `/demo/?demo=1`, which shows the persistent sample-data banner, Reset demo, and Open install instructions.
- Added a shared route announcer that focuses each destination heading without changing restored scroll position. Every product route, including 404, now has full route-specific metadata and the standard footer.
- Rewrote the reviewed controls and explanatory copy in plain language. `.factory/copy-audit.md` and the verb-first catalog description are current.
- Added the `ci-recheck` manifest claim and a packed-consumer regression that proves the non-interactive automated-check command exits successfully.

## Verification

- Clean-clone gate: cloned commit `a1ab5b0` into `/tmp/announce-check-claims-NllWua`, ran `npm ci`, then ran every exact command in `.factory/claims.json`. All 11 claims passed: `demo-first-difference`, `local-private-flow`, `site-no-tracking`, `offline-demo`, `download-package`, `cli-exit-codes`, `ci-recheck`, `origin-boundary`, `workflow-steps`, `package-formats`, and `mit-license`.
- Local: `npm run lint`, `npm test`, `npm run build`, `npm pack --dry-run --json --ignore-scripts`, and `git diff --check` passed. The build produced `dist/library`, `dist/site`, its package download, and a 13-entry versioned service-worker cache. Initial assets are 3.7 KB gzip CSS and 1.7 KB gzip JavaScript (route plus main); the 37 KB hero remains within the static budget.
- Live: `/opt/fleet/lib/verify-url.sh https://screen-reader-smoke-test.sociobot.in/ artifacts/polish-1-live` passed (HTTP 200, 669 ms, title/lang/main, one h1, alt and button checks, no console errors). Cold Playwright/Axe checks covered `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`, and `/missing-polish-1`; each had one h1/main, route-specific title, focused heading and live announcement, and 0 serious or critical Axe violations. The missing route returned HTTP 404.
- Evidence: [live desktop screenshot](/work/repo/artifacts/polish-1-live/screenshot-desktop.png), [live mobile screenshot](/work/repo/artifacts/polish-1-live/screenshot-mobile.png), [live demo mobile screenshot](/work/repo/artifacts/polish-1-live/demo-mobile.png), [mobile demo screenshot](/work/repo/artifacts/polish-1-demo-mobile.png), and [verify report](/work/repo/artifacts/polish-1-live/verify.json).

## Run and release

```sh
npm ci
npm test
npm run lint
npm run build
npm pack --dry-run --ignore-scripts
```

To deploy the static documentation site, build first, then run:

```sh
/opt/fleet/lib/deploy-static.sh screen-reader-smoke-test dist/site
```

The npm registry name is intentionally not published. The tested versioned tarball download remains the documented install path; registry publishing is a factory-owned release action and was not attempted.

## Known gaps

No unresolved review findings or product defects are known.
