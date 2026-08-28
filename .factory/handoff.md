# Verification handoff — FAIL

- Date: 2026-08-28 UTC
- Work order: `screen-reader-smoke-test-verify-4`
- Tested candidate: `e082d6d44da77d666482a9811aff3cb98c44745f`
- Tested URL: <https://screen-reader-smoke-test.sociobot.in/>
- Full evidence: `.factory/verification-4.md`

## Verdict

**FAIL. Do not publish the npm package from this candidate.** The production
site matches the candidate and its deployment, accessibility, privacy, PWA,
headers, caching, and performance checks pass. Two product defects block the
release:

1. **P1:** A native button named by a child image's `alt` is recorded only as
   `button`. Changing Chromium's accessible name from `Create account` to
   `Register now` still exits `0` with `matches: true` in a clean packed
   consumer. This is a false green in the core missing-label use case.
2. **P1:** The packed CLI's generated divergence report has an Axe `serious`
   color-contrast violation on both `First difference` labels: about 4.1:1
   instead of the required 4.5:1 at desktop and 390 px.

## Verification summary

- `npm ci`: pass, 95 packages, 0 vulnerabilities.
- `npm test`: pass, 6 files / 13 tests.
- `npm run typecheck`: pass.
- Lint: not configured.
- `npm run build`: pass; `dist/library` and `dist/site` produced.
- `node --check dist/site/sw.js`: pass.
- `npm pack --dry-run --json`: pass; 12 files, 49,411 B packed and
  213,241 B unpacked.
- Clean consumer: bin help/version, ESM, CommonJS, declarations, normal signup
  flow, invalid-input recovery, redaction, mismatch/recovery, empty transcript,
  invalid config handling, and origin blocking all passed except the reproduced
  image-derived-name false green.
- Live pages: candidate hashes match; desktop/390 px keyboard and touch targets
  pass; 0 serious/critical Axe issues on home/privacy/terms/404; no unexpected
  console/page failures or third-party requests/storage.
- PWA: cold-cache offline reload and stale-worker update regression pass.
- Lighthouse mobile: 95 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1,112 ms and CLS 0.
- Bundles: 3,111 B JS, 10,750 B CSS, 37,324 B hero, no fonts.

## Reverification commands

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

After repairs, repeat a real tarball install and the two exact regressions in
`.factory/verification-4.md`. The npm registry currently returns `E404` for
`screen-reader-smoke-test`; publishing is a factory-owned step after a passing
independent verification.
