# Polish 1 — review finding resolution

Date: 2026-08-30 UTC
Base review: `.factory/review-1.md` at `74e016a98532c49e2ed0ca7be0ab51c295546f16`
Repair: `a1ab5b03ea09d61a3b249dd23ff720291c5aabff`
Live URL: <https://screen-reader-smoke-test.sociobot.in/>

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Added `site/route.ts`, a visually hidden polite route announcer, `tabindex="-1"` on every route heading, and `focus({ preventScroll: true })` on `pageshow`. Added direct `?demo=1` routing to the isolated demo. | `documentation site > moves focus to each route heading and announces the destination`; `redirects the one-click ?demo=1 entry point into the isolated sample`; live cold check: `/` → `/demo/?demo=1` and Back both focused the destination h1 and announced it; [live demo](/work/repo/artifacts/polish-1-live/demo-mobile.png). |
| F-1-2 | Added route-specific Twitter title, description, and image tags to Demo, Privacy, and Terms; added complete description, canonical, Open Graph, and Twitter metadata to `404.html`. | `release metadata > publishes route-specific social metadata, canonical URLs, and the standard footer`; live cold check passed titles for `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`, and `/missing-polish-1` (404). |
| F-1-3 | Put `Version 0.1.0 · Built by Param Factory` and `Source (GitHub, opens external site)` in every footer, including 404. | Metadata/footer regression above; live root contains the exact factory attribution and external-link label. |
| F-1-4 | Added `ci-recheck` to `.factory/claims.json` and tagged the packed, fresh-consumer non-interactive recheck test. Replaced `CI` with “automated checks.” | `npm test -- --testNamePattern @claim:ci-recheck` passed from `/tmp/announce-check-claims-NllWua`; all 11 exact claim commands passed from that clean clone. |
| F-1-5 | Renamed the four report controls, the install-copy control, the demo exit action, and match/difference status labels so each states the result or action. | `documentation site > has no serious accessibility violations or console errors at desktop and mobile`; live cold root exposes “Show first difference” and “Copy install command”; demo banner exposes “Open install instructions.” |
| F-1-6 | Replaced JSON/live-region/CI jargon in first-read copy with “saved event list,” “keyboard focus,” “screen-reader status messages,” and “automated checks.” Updated the copy audit and terminology table. | `.factory/copy-audit.md`; `npm test -- --testNamePattern route-specific`; cold live root check in `artifacts/polish-1-live/verify.json`. |

## Cumulative review status

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` records before review 1. Every review 1 finding is resolved above; no minor finding was deferred. The clean-clone claims, local build suite, deployment, and live cold route/Axe recheck all passed.
