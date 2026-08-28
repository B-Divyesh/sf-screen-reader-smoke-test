# Announce Check v0.1.0 repair handoff — READY FOR RELEASE

Date: 2026-08-28

Work order: `screen-reader-smoke-test-repair-1`
Artifact: npm library + CLI + static documentation site
Base candidate repaired: `2f9fcd8bb0581e9c098e6be3a73ab93a779e7390`

## Repairs

1. Fixed the publishable `announce-check` bin. The ESM CLI now compares its
   module filename with the real path of `process.argv[1]`, so npm's
   `node_modules/.bin/announce-check` symlink invokes `main()` just like direct
   execution.
2. Increased every footer legal/source link's target to at least 44×44 CSS px.
   At desktop and 390 px, Privacy measures 58.81×44 px, Terms 44×44 px, and
   Source 50.42×44 px.
3. Added package-consumer regression coverage. It builds a tarball, installs it
   into a new `/tmp` consumer, asserts the installed bin is a symlink, runs
   `--help`, records a real local signup transcript with `--update --json`,
   proves fixture-value redaction, then runs a matching recheck. The site test
   now measures all three footer links at both desktop and mobile widths.

## Verification evidence

From a clean dependency install:

```sh
npm ci
npm test
npm run typecheck
npm run build
npm pack --dry-run
npm audit
npm audit --omit=dev
```

- `npm ci`: 95 packages; audit reported 0 vulnerabilities.
- `npm test`: **5 files / 8 tests passed**. This includes the new real packed
  consumer CLI regression, local browser-flow/redaction integration test,
  report escaping, remote-target refusal, and desktop/mobile Axe scan.
- `npm run typecheck`: passed. There is no separate lint tool configured in
  this intentionally minimal TypeScript package.
- `npm run build`: passed; publishes `dist/library` and static deploy root
  `dist/site/index.html`.
- `npm pack --dry-run`: passed; package contains ESM, CJS, declarations, CLI,
  README, changelog, and MIT license (41.5 kB compressed / 182.7 kB unpacked).
- `npm audit` and `npm audit --omit=dev`: 0 vulnerabilities.
- `verify-url.sh` against the production build at `127.0.0.1:4173`: HTTP 200,
  title, `lang=en`, one h1, main landmark, image alt text, labelled controls,
  and no console/page errors.
- Browser matrix against that production build at 1280×800 and 390×844:
  keyboard Tab visibly focuses the skip link; Space activates the divergence
  control; no horizontal issue; footer targets meet 44×44; Axe reports 0
  serious/critical violations; no third-party requests or console errors.
  Reduced motion computes instant durations and `scroll-behavior: auto`.
- Service worker verification at 390 px: controlled offline reload returned
  HTTP 200, displayed the offline banner, and the report state remained
  interactive.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1,204 ms, CLS 0, TBT 0 ms.
- Production assets: initial JS 3,111 bytes raw / 1,495 gzip; CSS 10,681 bytes
  raw / 3,315 gzip. Both are within the static-product budget.

## Publish and deploy

- Ready-to-publish package command: `npm pack` (the factory owns npm registry
  credentials; no package was published by this worker).
- Static deployment root: `dist/site/`; deployment configuration is
  `dist/site/staticwebapp.config.json` (copied from `site/public`).
- Deployed successfully with `/opt/fleet/lib/deploy-static.sh
  screen-reader-smoke-test dist/site` (Azure deployment ID
  `f222985c-e8d6-450a-ba2a-c4759a9f1257`). The configured custom domain is
  live at `https://screen-reader-smoke-test.sociobot.in/`.
- Live identity: the HTML references `assets/styles-DFCNwszS.css`; its SHA-256
  is `9aa74ae1cb86163fc001741b89a247d9d7855dec349cadbc33f86e5d696096b6`,
  exactly matching `dist/site`. Live URL smoke checks return HTTP 200 with the
  intended CSP/referrer/nosniff policies, no console errors, and the same
  desktop/390 px keyboard and 44×44 footer-target results.

## Known limits

- Chromium accessibility-tree semantics and DOM live-region mutations are not
  literal NVDA, VoiceOver, JAWS, or TalkBack speech. This remains an honest
  smoke test, not WCAG certification.
- v1 deliberately blocks remote targets unless `allowRemote: true`; separate
  authorized checks are needed for multi-origin flows.
