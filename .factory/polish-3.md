# Polish 3 — cumulative finding resolution

Date: 2026-08-30 UTC

Candidate: `cae2c69b4836aaf7d317e70f35f485b8274d5387`

Review commit supplied by the work order:
`5943d87345db41dd36a3e3084ca4a13948afab9b`

Deployed code commits: `2928020bea73d232044c270a9037d6523ad8c5cd`,
`90122f79f6079df0f2a33e1d90e0a4377cd5f93a`

Live URL: <https://screen-reader-smoke-test.sociobot.in/>

The supplied commit and all reachable history contain `.factory/review-1.md`
and `.factory/review-2.md`; they do not contain `.factory/review-3.md`. The
controller's additional deterministic-harness finding is mapped as C-3-1.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Retained destination-heading focus, polite announcements, direct demo navigation, and Back focus. Expanded the route matrix across all public routes and both viewports. | `documentation site > has no serious accessibility violations...`; `moves focus to each route heading...`; `artifacts/polish-3-live/live-check.json` → `routes` and `navigation`. |
| F-1-2 | Retained exact per-route titles, descriptions, canonicals, Open Graph, and Twitter metadata, including 404; assertions now check exact title and canonical values. | `release metadata > publishes route-specific social metadata...`; live route matrix; [404 mobile](../artifacts/polish-3-live/404-mobile.png). |
| F-1-3 | Retained `Version 0.1.0 · Built by Param Factory` and explicit external GitHub wording in every footer; tests assert exact legal link names and targets. | Route metadata/footer test; live route matrix and link crawl in `live-check.json`. |
| F-1-4 | Retained the non-interactive automated-check claim and packed-consumer proof. Standardized the manifest wording on “event list.” | Clean clone `npm test -- --testNamePattern @claim:ci-recheck` — PASS. |
| F-1-5 | Retained result-naming controls and the real CLI report headings `No differences found` / `First difference found`; old phrases remain rejected by tests. | `@claim:local-private-flow`; `test/runner.test.ts`; live demo status in `live-check.json`. |
| F-1-6 | Retained plain first-read “event list,” focus, status-message, and automated-check wording. Updated the claims manifest and copy audit to the same term. | `.factory/claims.json`; `.factory/copy-audit.md`; live home screenshot. |
| F-2-1 | Retained the compact populated result before editors. The direct `/?demo=1` test now asserts the changed action and both messages fit inside 390 × 844 and 1280 × 800. | `@claim:demo-first-difference`; [live demo mobile](../artifacts/polish-3-live/demo-mobile.png); live bounds in `live-check.json`. |
| F-2-2 | Retained removal of npm-registry status and future-publication promises. | `rg` source audit; `.factory/copy-audit.md`; clean-clone claim inventory test. |
| F-2-3 | Retained `cli-output-modes` and its packed-consumer checks for default report, JSON, selected report path, and no report. | Clean clone exact `@claim:cli-output-modes` command — PASS. |
| F-2-4 | Retained `build-artifacts` and `local-site`. The local-site proof now consumes the single shared Vite server instead of spawning one per test. | Clean clone exact `@claim:build-artifacts` and `@claim:local-site` commands — PASS. |
| F-2-5 | Retained removal of the untestable future change-notice promise. | Terms source test and live `/terms/` route check. |
| F-2-6 | Standardized reliance copy and claim copy on “event list”; technical `Transcript*` names remain only in the public TypeScript API. Regenerated the copy-audit round marker. | `.factory/copy-audit.md`; `maps every declared claim to exactly one tagged observable test`. |
| F-2-7 | Retained the plain `Limits` label and `What Announce Check can and cannot prove.` heading. | Shared-header route matrix at 1280 and 390 px. |
| F-2-8 | Retained one header model on home, demo, privacy, terms, and 404; tests assert the exact four labels and destinations. | Browser route matrix and source metadata test; `live-check.json`. |
| F-2-9 | Retained tested privacy, offline, and MIT facts. Tests and live checks assert the action and complete fact block fit the first screen at all required sizes. | `keeps the first action...inside the first screen`; live mobile bounds (facts end at 694.03 of 844 px); [home mobile](../artifacts/polish-3-live/home-mobile.png). |
| C-3-1 | Replaced two Vite startup paths and a 15-second stdout match with one `globalSetup` process, HTTP content readiness polling for up to 60 seconds, injected shared origin, process-group cleanup, and one `globalTeardown`. No test starts Vite. | [failure reproduction](../artifacts/polish-3-local/harness-reproduction.txt); [three repeated runs](../artifacts/polish-3-local/repeated-suite-runs.txt); final clean clone 27/27; no Vite process after every run. |
| P-3-1 | The final cold visual audit found Reset could focus the editor 15 px under the sticky mobile banner. Reset now centers the editor before focusing without another scroll; a viewport regression prevents overlap. | `@claim:demo-first-difference`; final live editor y=320.77, banner bottom=107.58; [live demo mobile](../artifacts/polish-3-live/demo-mobile.png). |

## Claims and clean-clone evidence

`.factory/claims.json` contains 14 unique claims. `release metadata > maps every
declared claim to exactly one tagged observable test` rejects missing, duplicate,
or unknown tags. Every exact manifest command passed independently from clean
clone `/tmp/announce-check-polish-3-final-Ws56dI` at `90122f7`; see
[`clean-clone-verification.txt`](../artifacts/polish-3-local/clean-clone-verification.txt).

## Deployment and live evidence

- Final static deployment: `3e0c1171-be51-412a-90f2-6ca96e851248`.
- `/opt/fleet/lib/verify-url.sh` passed in
  [`verify.json`](../artifacts/polish-3-live/verify.json): 552 ms, no console
  errors, one h1/main, no missing alt text, no unlabeled buttons.
- Fresh Playwright contexts checked all routes at 1280 × 800 and 390 × 844,
  the direct demo, reset, storage, requests, forward/Back focus, HTTP 404,
  legal links, offline reload, reduced motion, security headers, and all public
  assets. Axe found zero serious or critical violations.
- The local and live package downloads have the same SHA-256:
  `2924e0837edd70b7b51f6d35aaa4c0af44673f792c60dd5ab91d2d2b0e5c23c3`.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.1 s, CLS 0, TBT 30 ms, 46 KiB transfer. Raw report:
  [`lighthouse.json`](../artifacts/polish-3-live/lighthouse.json).

No finding from either available review, either earlier polish audit, the
controller evidence, or the final cold visual audit remains unresolved.
