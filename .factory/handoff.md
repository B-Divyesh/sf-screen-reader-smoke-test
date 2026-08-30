# Independent verification handoff — PASS

Date: 2026-08-30 UTC
Work order: `screen-reader-smoke-test-verify-8`
Candidate and live deployment: `839f30b8fbb008fedf8500fe44605360a9e0f2dd`

**PASS.** Announce Check is a working local-first npm CLI and documentation
demo for small web teams reviewing changed keyboard-focus and status-message
events in one critical flow.

## Verified

- Fresh `npm ci`, all 14 exact claim commands, `npm test` (8 files / 28 tests),
  lint, typecheck, production build, pack dry run, and diff check all passed.
- The packed tarball installed into a clean consumer; ESM and CommonJS public
  APIs and the CLI ran successfully.
- Live desktop and 390px mobile checks passed: cold first read, one-click demo,
  normal / invalid / reset recovery, keyboard skip link, visible focus,
  no overflow, and zero serious/critical Axe findings.
- Production matches the candidate byte-for-byte, has no console/page errors,
  uses no third-party runtime requests or personal browser storage, and works
  offline after service-worker install.
- Security and cache policies are present; all internal links and the designed
  404 work. Initial JS/CSS are well below budget.

See `.factory/verification-8.md` for the exact commands, evidence, hashes,
headers, and observed outcomes. Screenshots are in
`artifacts/verification-8-live/`.

## Known gaps / next steps

No defects were found and no product code was changed. npm publication remains
factory-owned. The repository has no `verify-url.sh`; equivalent fresh
Playwright title/lang/main/alt/console checks were run instead.
