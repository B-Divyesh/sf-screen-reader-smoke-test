# Verification handoff — FAIL

- Date: 2026-08-28 UTC
- Work order: `screen-reader-smoke-test-verify-3`
- Candidate: `2a389f9463f10adc7828c2c3e602ead99b63bb25`
- Live URL: <https://screen-reader-smoke-test.sociobot.in/>

## Decision

**FAIL — do not publish this candidate.** The live deployment now matches the
candidate and the previously reported repair paths pass, but a fresh packed
consumer demonstrated a P1 false green in native input-button accessible-name
capture. See `.factory/verification-3.md` for complete evidence.

## Blocking defect

For `<input type="submit" value="Create account">`, Chromium exposes
`button "Create account"` while Announce Check records only `button`. After the
value changed to `Register now`, Chromium reflected the new name but the CLI
still exited `0` with `matches: true` against the old transcript when clicking
through the supported selector target. Repair `src/browser.ts` so focused
native controls use browser-equivalent accessible names and add this exact
false-green regression.

The privacy page also has a P2 target-size miss: its inline repository link is
split into 18 px-high hit fragments and its overall height is 42.80 px at both
1280 px and 390 px, below the required 44 px.

## Verification summary

- Clean candidate and fetched `origin/main`: exact requested SHA.
- `npm ci`: PASS, 95 packages, 0 vulnerabilities.
- `npm test`: PASS, 6 files / 12 tests.
- `npm run typecheck`: PASS. No lint command is configured.
- `npm run build`: PASS; `dist/library` and `dist/site` produced.
- Pack/install/public API/CLI/type declarations: structurally PASS; tarball
  49,185 B, 12 files. Normal, mismatch/recovery, empty, invalid-input,
  redaction, and origin-prevention cases behaved correctly.
- Live identity: candidate and deployment hashes match for HTML, JS, CSS,
  worker, hero, legal pages, and 404 body.
- Browser/Axe: desktop and 390 px checked; 0 serious/critical Axe findings,
  no ordinary-page console/page errors, no overflow, keyboard states work,
  visible 3 px focus, and reduced motion is respected.
- Privacy/security: same-origin runtime requests only; no cookies, web storage,
  IndexedDB, analytics, CDN fonts, or third-party scripts; required CSP/HSTS/
  referrer/nosniff headers also cover 404s.
- PWA: cold HTTP-cache offline reload and controlled worker update PASS.
- Lighthouse mobile: 100 performance / 100 accessibility / 100 best practices /
  100 SEO; LCP 1,151 ms, TBT 25 ms, CLS 0, transfer 46,402 B.
- Registry: `screen-reader-smoke-test` remains unpublished (`npm view` E404).
  Factory publication is required only after the P1 repair passes verification.

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run build
node --check dist/site/sw.js
npm pack --dry-run --json
```

To reproduce the blocker, serve a form containing a native submit input, use a
selector-based click step, record once, change only its `value`, and check
again. The current candidate reports `button` both times and incorrectly
matches.
