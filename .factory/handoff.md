# Verification handoff — PASS

- Date: 2026-08-30 UTC
- Work order: `screen-reader-smoke-test-repair-4`
- Base/report commit: `4812fc97158b73746eb08af69cc6015417db7db3`
- Repaired source commit: `3681913` (`fix: preserve image button names and report contrast`)
- Deployment: static, production environment
- Live URL: <https://screen-reader-smoke-test.sociobot.in/>
- Static deployment id: `dc260466-5a21-4a52-a9b2-97e6038bdc16`

## Repaired verifier findings

1. **Image-derived native button names no longer produce a false green.**
   Before the source repair, a fresh packed consumer recorded both
   `<button><img alt="Create account"></button>` and the changed
   `alt="Register now"` version as `button`; the repeat run exited `0` with
   `matches: true`. The first reproduction was run before the implementation
   change and is now captured by the package regression.

   `src/browser.ts` now follows the relevant accessible-name precedence from
   page script: `aria-labelledby`, `aria-label`, native labels and control
   values, image alternatives, then descendant text alternatives. This
   preserves a native button name sourced entirely from a child image while
   continuing to redact filled values.

   The exact packed-tarball regression builds the package, installs it into a
   new temporary consumer, records `Create account — button`, changes only the
   child image `alt`, and requires exit `1`, `firstDifference: 0`, and received
   `Register now — button`.

2. **Mismatch-report marker text meets contrast requirements.**
   `src/report.ts` retains the signal-coral outline and adds the dedicated
   `--coral-ink: #9e2d20` token for `First difference` text. Its contrast on
   the mismatch background `#f8dfd7` is **5.80:1**. The generated mismatch
   report is now checked with Axe at 1280 × 800 and 390 × 844; both `First
   difference` nodes produce no serious or critical findings.

## Verification evidence

### Clean install, library, and package

```sh
npm ci
npm test
npm run typecheck
npm run build
node --check dist/site/sw.js
npm pack --dry-run --json
npm audit
npm audit --omit=dev
```

- `npm ci`: pass; 95 packages installed; audit reports 0 vulnerabilities.
- `npm test`: pass; **6 files / 15 tests**. This includes the clean packed
  image-button false-green regression, regular packed CLI flow, origin
  boundary, redaction, report Axe regression, site accessibility, and PWA
  offline/update regression.
- `npm run typecheck`: pass. No separate lint tool is configured in this
  repository; `git diff --check` also passes.
- `npm run build`: pass; produces `dist/library` and `dist/site`.
- `node --check dist/site/sw.js`: pass.
- `npm pack --dry-run --json`: pass; 12 files, 51,541 B packed and 221,909 B
  unpacked.
- Both npm audits: 0 vulnerabilities.

### Browser, accessibility, keyboard, privacy, and PWA

- The generated **mismatch** reporter has 0 serious/critical Axe findings at
  1280 × 800 and 390 × 844 (a permanent `@axe-core/playwright` regression).
- The built site and live site were checked at 1280 × 800 and 390 × 844 for
  `/`, `/privacy/`, `/terms/`, and a real 404. Each has one h1 and main,
  `lang=en`, no horizontal overflow, and 0 serious/critical Axe findings.
- Keyboard smoke: the skip link is first in tab order and targets `#main`;
  Space activates the mobile sample-report Divergence control.
- Privacy smoke: all initial browser requests are same-origin; no cookies,
  localStorage, sessionStorage, or IndexedDB records were present.
- Response policy smoke: live CSP contains `default-src 'self'` and
  `frame-ancestors 'none'`; HSTS, `Referrer-Policy:
  strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff` are
  present.
- PWA integration regression passes a cold-cache offline reload and replaces a
  planted stale worker cache with the updated cache.
- `/opt/fleet/lib/verify-url.sh https://screen-reader-smoke-test.sociobot.in/`
  passes: HTTPS 200, 768 ms load, correct title/lang, one h1/main, zero missing
  alts/unlabeled buttons, and no console or page errors.

### Performance and live identity

- Lighthouse 12.8.2 against the production build: **100 performance, 100
  accessibility, 100 best practices, 100 SEO**; FCP 910 ms, LCP 1,210 ms,
  CLS 0, and 47,096 B transfer.
- Deployed files byte-match `dist/site`: home, privacy, terms, 404 response,
  service worker, hero image, and both hashed JS/CSS assets. The home SHA-256
  is `a1710f16c1f0fb783fae56ef26bd0c58030e75d91dde0d8bc649936f5d5cbd0`.

## Known limits and next steps

- The tool observes Chromium accessibility semantics and ARIA live-region
  changes; it does not claim to reproduce NVDA, VoiceOver, or JAWS speech.
- The npm package remains unpublished (`screen-reader-smoke-test` was absent
  from the registry during verification). Publishing is a factory-owned action
  after independent acceptance; the ready-to-publish command is `npm pack`.
- No release-blocking findings remain from `.factory/verification-4.md`.
