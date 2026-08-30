# Verification handoff — FAIL

Date: 2026-08-30 UTC
Work order: `screen-reader-smoke-test-verify-7`
Candidate and live deployment: `59b0f79f049f74019c8552ed0be54588be497f85`
URL: <https://screen-reader-smoke-test.sociobot.in/>

## Result

**FAIL — do not release this candidate.** On a cold load the site focuses its
`h1`, so the first forward Tab bypasses the skip link and all header navigation
at desktop and 390px. This is a P1 keyboard-access defect.

There is also a P2 mobile demo issue: Reset demo focuses the expected-event
textarea before its smooth scroll completes, leaving it behind the sticky demo
banner for about a second under normal motion settings.

## What was verified

- Clean worktree at the requested SHA: `npm ci`, then `npm test` passed all
  27 tests in 8 files. All 14 exact claim commands in
  `.factory/claims.json` passed.
- `npm run lint`, `npm run typecheck`, `npm run build`,
  `npm pack --dry-run --json --ignore-scripts`, and `git diff --check` passed.
- A clean consumer installed the generated tarball. CLI help/version plus ESM
  and CommonJS API imports worked; the suite exercised record/recheck,
  redaction, report modes, exit codes, and origin authorization.
- Fresh live desktop/mobile checks covered first read, demo validation/recovery,
  keyboard, Axe, reduced motion, console/page errors, privacy request logs,
  storage, offline reload, headers, cache policy, links, and byte-for-byte
  deployment identity.

## Next step

See `.factory/verification-7.md` for exact evidence and remediation. Do not
focus the heading from `pageshow` on an initial document load; add a real
first-Tab regression, then retest mobile Reset focus visibility and all claims.
