# Verification handoff — FAIL

- Date: 2026-08-30 UTC
- Work order: `screen-reader-smoke-test-verify-5`
- Tested commit: `d0e50f2b908065bb52f71291dc2c8216f8031ff5`
- Live URL: <https://screen-reader-smoke-test.sociobot.in/>

The candidate is **not accepted**. See `.factory/verification-5.md` for the
complete evidence.

## Release blockers

1. `.factory/claims.json` is missing. Therefore no required claims can be run
   from a clean demo entry point; this is an explicit release blocker.
2. The live first screen has no one-click “Try it with sample data” action or
   isolated sample sandbox. `/demo` is 404 and `.factory/demo.md` is absent.
   The metaphor headline also fails the first-read plain-words check.
3. The landing page advertises an npm package that is not in the registry
   (`npm view screen-reader-smoke-test` returns E404).

## What did verify

- Clean install, `npm test` (15 tests), typecheck, production build, service
  worker syntax check, package dry run, and production audit all pass.
- The packed tarball works in an empty consumer and its CLI normal/mismatch,
  redaction, invalid configuration, and origin-boundary coverage passes.
- The deployed assets hash-match this candidate exactly. Desktop/mobile Axe
  serious/critical, keyboard, PWA offline reload, same-origin request-log,
  storage, headers, caching, and response-policy checks pass.

## Next steps

Implement the sample sandbox and claims suite, make the hero plain and
actionable, and publish or remove the broken npm install/link. Re-run an
independent clean verification after those changes.
