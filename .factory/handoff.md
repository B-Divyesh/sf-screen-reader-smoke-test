# Announce Check v0.1.0 handoff

Date: 2026-08-28

Work order: `screen-reader-smoke-test-build-1`

Artifact: npm library + CLI + static documentation site

## What shipped

- Typed public API with `defineConfig`, `runCheck`, `compareTranscripts`, and
  `renderReport`; ESM, CommonJS, and `.d.ts` outputs.
- Non-interactive `announce-check` CLI with helpful `--help`, `--update`,
  `--json`, `--report`, and `--no-report` options and documented exit codes
  `0` (match/update), `1` (divergence), and `2` (run/configuration error).
- Chromium flow driver for fill, click, press, navigation, and wait steps.
- Ordered focus contracts sourced from Chromium ARIA snapshots, plus relevant
  required/disabled/invalid/expanded/checked state changes and debounced ARIA
  live-region mutations.
- Exact first-divergence comparison and a responsive, self-contained local HTML
  report with match, mismatch, and empty states.
- Privacy safeguards: loopback-only targets unless `allowRemote: true`, strict
  same-origin navigation during a run, fixture-value redaction from events and
  errors, and no telemetry or network storage.
- Product-specific documentation site with interactive match/divergence/empty/
  browser-error states, offline messaging and cached shell, privacy and terms
  pages, responsive 390 px layout, and static-host security/cache headers.
- Original generative-geometry hero at `site/public/announce-field.webp`
  (37,324 bytes). Prompt and factory deployment provenance are recorded in
  `.factory/design.md` and `.factory/announce-field-generation.json`.

## Build and verification

From a clean clone:

```sh
npm ci
npm test
npm run build
npm pack --dry-run
```

- `npm test`: 4 files, 7 tests passed. This includes a real local signup flow
  through Playwright, transcript update/recheck, fixture-value redaction, HTML
  reporting, remote URL refusal, CLI parsing, and desktop/mobile axe scans.
- `npm run typecheck`: passed with strict TypeScript.
- `npm run build`: passed; static deploy root is `dist/site/index.html` and the
  publishable library is in `dist/library/`.
- `npm pack --dry-run`: passed. Package includes ESM, CJS, declarations, CLI,
  source maps, README, changelog, and MIT license. The factory should publish;
  no registry action was taken here.
- `npm audit` and `npm audit --omit=dev`: 0 vulnerabilities.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 ...`: HTTP 200, title and
  language present, exactly one h1, main landmark present, no missing image alt,
  no unlabeled buttons, and no console/page errors.
- Lighthouse 12.8.2, mobile profile against the production build:
  Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.2 s,
  CLS 0, Total Blocking Time 0 ms. INP is not available from a no-interaction
  lab run; the shipped interaction script is 3.11 KB raw and produces no long
  tasks in the audit.
- Production asset sizes: initial JS 3.11 KB raw (1.48 KB gzip), CSS 10.57 KB
  raw (3.28 KB gzip), hero WebP 37.32 KB. All are well below the product budgets.

## Known limits

- This is intentionally Chromium-only v1. Browser accessibility-tree semantics
  and live-region DOM changes are not the speech output of NVDA, VoiceOver,
  JAWS, or TalkBack and are not WCAG certification. The CLI, report, site, and
  terms state this explicitly.
- Live-region text is captured after a short debounce; AT-specific queueing for
  `aria-atomic`, `aria-relevant`, and interrupted speech is outside v1 scope.
- Navigations to a second origin are rejected. Teams with authorized multi-
  origin authentication flows should split them into separate checks.

## Recommended next steps

1. Publish `screen-reader-smoke-test@0.1.0` from the factory registry account.
2. Recruit five pilot teams and collect only opt-in qualitative feedback; the
   package itself should remain telemetry-free.
3. Use pilot evidence to prioritize additional browser/AT adapters as a
   separate capability, without weakening the honest browser-semantics label.
