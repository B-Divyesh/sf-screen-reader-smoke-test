# Independent QA handoff — FAIL

Date: 2026-08-28
Work order: `screen-reader-smoke-test-verify-2`
Tested commit: `a75ee78246e52e3c0e6f6bbf1cfff2d457ba5938`
Tested URL: <https://screen-reader-smoke-test.sociobot.in/>

## Verdict

**FAIL — do not publish v0.1.0 yet.** The repaired npm symlink works and the
live deployment exactly matches the candidate, but independent consumer
testing found false focus transcripts in a normal invalid-input/recovery form
flow. An unknown config action also silently exits green, and origin protection
detects cross-origin navigation only after the outbound request.

Full evidence: [`.factory/verification-2.md`](verification-2.md).

## Release-blocking defects

- **P1:** The real focus sequence `button → input → button → heading` is
  recorded as `input → input → heading → heading`. The queued
  `locator(":focus").ariaSnapshot()` reads the later active element and erases
  both submit-button focus events.
- **P1:** `{ action: "clik" }` is accepted as a no-op; `--update` exits `0` and
  approves an empty matching transcript. Runtime step validation is incomplete.
- **P1:** A click from the approved origin to a controlled second origin sent
  `GET /escaped` before the CLI rejected the origin with exit `2`.
- **P2:** Offline reload fails after the normal HTTP cache is cleared because
  generated CSS/JS are not precached and receive HTML fallback responses. A
  service-worker update also leaves cached `/` stale indefinitely.
- **P3:** 404 responses omit CSP/HSTS/referrer/nosniff headers present on real
  pages and assets.

## What passed

- Clean `npm ci`; 0 vulnerabilities.
- `npm test`: 5 files / 8 tests passed.
- `npm run typecheck`, `npm run build`, `npm pack --dry-run`, `npm audit`, and
  `npm audit --omit=dev` passed. No lint script is configured.
- Packed tarball: 41,537 B / 182,707 B unpacked. Installed npm bin, ESM, CJS,
  declarations, exit codes, mismatch report, empty state, recovery, and filled
  value redaction were exercised in a clean consumer.
- Live candidate identity matched by SHA-256 for HTML, SW, JS, CSS, and hero.
- Desktop and 390 px: keyboard states, focus, 44 px targets, responsive layout,
  reduced motion, clean console, and 0 serious/critical Axe findings passed.
- Privacy/network checks found same-origin-only initial requests, no analytics,
  cookies, local/session storage, IndexedDB, CDN scripts, or external fonts.
- Headers and caching pass on real content. Warm-cache offline reload works,
  but the cold-cache/update cases above do not.
- Lighthouse mobile: Performance 96, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1,090 ms; CLS 0; 46,411 B transferred.

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run build
npm pack --dry-run --json
npm audit
npm audit --omit=dev
```

Then install `npm pack` output into a clean consumer and use a form whose submit
handler synchronously focuses an invalid input or confirmation heading. Compare
raw `focusin` events with the CLI transcript. Also test an unknown action,
abort-before-send origin enforcement, and service-worker offline reload after
clearing the browser HTTP cache.

## Remaining release work

Repair and regression-test the P1/P2 issues, rerun independent verification,
then let the factory publish the package. The registry currently returns E404
for `screen-reader-smoke-test`; verifiers must not publish it.
