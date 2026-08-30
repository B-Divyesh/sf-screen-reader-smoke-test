# Independent verification — FAIL

- Date: 2026-08-30 UTC
- Work order: `screen-reader-smoke-test-verify-5`
- Candidate commit: `d0e50f2b908065bb52f71291dc2c8216f8031ff5`
- Candidate URL: <https://screen-reader-smoke-test.sociobot.in/>
- Result: **FAIL — release blocking acceptance-contract defects**

## Blocking findings

### P0 — required claims manifest and claim tests are absent

This clean checkout has no `.factory/claims.json`. Consequently no claim test
can be run from the required demo entry point. This is explicitly
release-blocking under the supplied `claims` contract, regardless of the
passing repository test suite.

The page and README also make user-reliant claims without the required
manifest/test coverage, including “Free, open source, no telemetry,” “no
telemetry, accounts, cookies, remote fixture storage, or third-party runtime
assets,” and the privacy-policy assertion that reports/transcripts/form values
are not sent to the product.

### P0 — no one-click sample-data sandbox; first-read test fails

A cold live visit presents the headline **“Hear the break before your users
do.”** It is a metaphor, not a plain statement of the job. The first screen
does not plainly name the intended small web-team user. Its only interactive
action in the hero is `Copy` for the install command; there is no visible
**“Try it with sample data”** action, no persistent “Demo — sample data,
nothing is saved” banner, reset control, or start-for-real control.

`/demo` and `/demo/` both return HTTP 404. `?demo=1` returns the ordinary
landing page, not a demo state. `.factory/demo.md` is absent. This violates
the supplied `plain-words` and `demo-sandbox` contracts and means the
verifier cannot exercise claims through an isolated, one-click product demo.

### P1 — advertised npm install/package link is not currently usable

The landing page presents `npm i -D screen-reader-smoke-test` and a “View npm
package” link. Fresh `npm view screen-reader-smoke-test version` returns npm
registry `E404 Not Found`; the named package is not published. The factory
may own publication, but the deployed user-facing install path and external
package link are not usable at verification time. The packed local tarball is
healthy (see below), so this is a release/publishing gap rather than a
tarball-build failure.

## Required claim-test gate

Checked before other product tests from the clean candidate:

| Required input | Result | Evidence |
| --- | --- | --- |
| `.factory/claims.json` | **FAIL** | File absent in the clean checkout. No claim commands exist to run. |
| Demo entry point | **FAIL** | `/demo` and `/demo/` are 404; `?demo=1` is the normal landing page. |

## Clean local verification

`npm ci` completed with 0 audit vulnerabilities. These non-claim tests pass,
but do not override the blocking gate above:

| Check | Result | Evidence |
| --- | --- | --- |
| `npm test` | PASS | 6 files, 15 tests in 37.59 s. Includes normal local signup record/update/recheck, invalid configuration rejection, remote-origin boundary, redaction, generated-report axe checks, service-worker offline/update, and clean packed-consumer checks. |
| `npm run typecheck` | PASS | `tsc --noEmit` clean. No separate lint script is configured. |
| `npm run build` | PASS | Produces `dist/library` and `dist/site`. |
| `node --check dist/site/sw.js` | PASS | Syntax check clean. |
| `npm pack --dry-run --json` | PASS | 12 files; 51,541 B package / 221,909 B unpacked. |
| `npm audit --omit=dev` | PASS | 0 vulnerabilities. |
| `git diff --check` | PASS | Clean before writing this report. |

The package integration suite installs a newly packed tarball into an empty
consumer, invokes the public `announce-check` binary, records a local signup
contract, rechecks it, and verifies that a changed native-image button name
causes exit 1 at the first difference. It also verifies filled values do not
appear in the saved expected transcript. This demonstrates the core CLI
normal, mismatch, invalid-input, recovery, and privacy-redaction paths.

## Live deployment and browser QA

### Candidate identity

The live deployment is the tested candidate, not a stale deployment. SHA-256
matched the locally rebuilt candidate for `/`, `/privacy/`, `/terms/`, the 404
page, `sw.js`, both hashed assets, and `announce-field.webp`. For example,
home is `a1710f16c1f0fb783fae56ef26bd0c58030e75d91dde0d8bc649936f5d5c5bd0`.

### Desktop/mobile/a11y/keyboard

Fresh Playwright checks at 1280×800 and 390×844 found, for `/`, `/privacy/`,
and `/terms/`: HTTP 200, one `h1`, one `main`, `lang=en`, no horizontal
overflow, no page errors, and no Axe serious/critical violations. The custom
404 is HTTP 404 with one `h1`/`main`; its expected failed-resource console
message was the only console error on that route.

Keyboard checks found the skip link first in tab order, followed it to
`#main`, and used Space on the sample-report “× Divergence” button at desktop
and 390 px to change the visible status to “Contract diverged.” All visible
home links/buttons measured at least 44×44 CSS px at both sizes; the three
hidden mobile nav anchors have zero layout size by design. Reduced-motion was
used for the browser checks. The stylesheet supplies a 3 px `:focus-visible`
outline; the cold mobile keyboard check rendered it in blueprint `#2446d8`.

### Privacy, headers, cache, and PWA

The live home-page request log contains only the document, same-origin JS,
same-origin CSS, and same-origin hero image. Fresh contexts contain no cookies,
localStorage, sessionStorage, or IndexedDB records before the service worker
is registered. No analytics/tracking/network call was observed.

Responses provide CSP `default-src 'self'` with `connect-src 'self'` and
`frame-ancestors 'none'`, HSTS (`max-age=31536000; includeSubDomains`),
`Referrer-Policy: strict-origin-when-cross-origin`, and
`X-Content-Type-Options: nosniff`. Hashed JS/CSS are
`public, max-age=31536000, immutable`; the hero has one-day caching; `sw.js`
is `no-cache`; HTML has a 30-second must-revalidate cache.

In a new 390 px browser context, the live worker became controlling after a
reload. A subsequent offline reload succeeded, retained the home document and
showed the offline banner without console/page errors. The repository
regression additionally tests cache-version replacement on an updated worker.

This static site has no server-side product/API endpoints and no sign-in flow;
therefore there is no rate-limit allowance or identity-provider flow to test.

## Needed before acceptance

1. Add `.factory/claims.json` and exactly one runnable demo-entry claim test
   for every live/README claim, including an observed-request privacy test.
2. Implement and document a real one-click library playground or CLI sample
   sandbox (`/demo` or `?demo=1`) with realistic bundled sample flow, separate
   demo storage, banner, reset, and start-for-real behavior.
3. Replace the metaphor hero with a <=9-word plain job headline, name small
   web teams in the adjacent sentence, and place “Try it with sample data” on
   the first screen with a concise result description.
4. Publish the approved package or remove/replace the live npm install/link
   until it resolves; then re-run this verification from a clean consumer.
