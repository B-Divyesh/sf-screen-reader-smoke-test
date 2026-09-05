# Review 4 — Verify browser announcement changes — PASS

Date: 2026-09-05 UTC
Work order: `screen-reader-smoke-test-review-4`
Live URL: <https://screen-reader-smoke-test.sociobot.in/>
Implementation candidate: `69d37616d7f72049a1aa6dd7c6b9800fec20af79`
Documentation candidate: `2314eb84655aa259a41aa75ec0fb3204a9849560`

## Verdict

**PASS — zero findings and zero untested claims.** The live site, live package
download, clean library consumer, and clean candidate checkout meet the stated
product, demo, claim, accessibility, privacy, and route requirements.

## Job, audience, and first action

Before scrolling, the live page says “Catch changed keyboard focus and status
messages.” It is for small web teams checking one critical form flow before
release. The first action is “Try it with sample data”; its adjacent text says
it loads a sample event list and shows its first change.

This was visible in fresh 1280 × 800 desktop and 390 × 844 phone browser
contexts. The primary action ended at y=634 on desktop and y=530 on phone, so
it did not require scrolling.

## Clean checkout and declared claims

I cloned the documentation candidate into a separate clean directory, ran
`npm ci`, then completed these commands without interruption:

```sh
npm test
npm run lint
npm run build
npm pack --dry-run --json --ignore-scripts
git diff --check
```

`npm test` passed all 9 files and 32 tests. The build produced `dist/library`
and `dist/site`; lint, pack, and the whitespace check passed. The build output
is within the documented static budget: home JavaScript 1.19 kB gzip, demo
JavaScript 1.28 kB gzip, and CSS 4.01 kB gzip.

Every exact command declared in `.factory/claims.json` passed independently:

| Claim id | Result |
| --- | --- |
| `demo-first-difference` | PASS |
| `local-private-flow` | PASS |
| `site-no-tracking` | PASS |
| `offline-demo` | PASS |
| `download-package` | PASS |
| `cli-exit-codes` | PASS |
| `ci-recheck` | PASS |
| `cli-output-modes` | PASS |
| `build-artifacts` | PASS |
| `local-site` | PASS |
| `origin-boundary` | PASS |
| `workflow-steps` | PASS |
| `package-formats` | PASS |
| `mit-license` | PASS |

There are no missing commands, failed commands, unmatched claim tags, or
untested public claims.

## Installed artifact and implementation identity

The live versioned download installed into a fresh temporary Node project. Its
ESM and CommonJS exports were `compareTranscripts`, `defineConfig`,
`eventToLine`, `renderReport`, and `runCheck`; `announce-check --help` ran and
documented its exit codes. The live tarball and the clean-candidate tarball
have the same SHA-256:

`f496ee5d30bd7c508faead12c69b818edd51846a4d3bef6ffee413e9d5e1b025`

That byte match ties the deployed package to implementation candidate
`69d37616d7f72049a1aa6dd7c6b9800fec20af79`. The later documentation/report
commit is `2314eb84655aa259a41aa75ec0fb3204a9849560`; it does not require a new
product image.

## Live desktop and phone checks

Fresh desktop and phone contexts passed the real sample flow:

- The first Tab reached “Skip to main content”; one `h1`, one `main`,
  `lang="en"`, and the correct home title were present.
- One click entered `/demo/?demo=1`. The visible, populated result named the
  event-3 difference: `Account created` versus `Check your inbox`.
- The persistent banner said “Demo — sample data, nothing is saved.” Matching
  input produced “No differences found.” Invalid input named line 1 and the
  required event prefixes. Space on Reset restored the bundled sample and
  focused the expected-event input.
- No cookies, localStorage, sessionStorage, or IndexedDB data appeared before,
  during, or after the sample flow. Observed demo-flow requests were same
  origin only; there were no normal-flow console errors or failed requests.
- Privacy navigation and browser Back focused the destination `h1` and updated
  the polite route announcement. Enter operated comparison and Space operated
  Reset.
- After service-worker control, a fresh phone context reloaded the demo offline
  with HTTP 200, the offline notice, the populated result, and no console
  errors. Reduced motion reduced transitions to `0.01ms`.

`@axe-core/playwright` found zero serious or critical violations on `/`,
`/demo/`, `/privacy/`, `/terms/`, and the styled missing route at 390 px. Each
route has one `h1`, one `main`, correct route title, description, canonical,
Open Graph, and Twitter metadata, with no horizontal overflow. The deliberate
missing route returned HTTP 404 with a designed recovery page. Its browser
resource-status console message is expected for a deliberate HTTP 404, not a
page failure.

All resolved home, demo, privacy, terms, robots, sitemap, download, and public
source links returned HTTP 200. Live headers include self-only CSP, HSTS,
`nosniff`, and strict-origin referrer policy.

## Earlier finding disposition

| Earlier record | Current disposition |
| --- | --- |
| Original verification | Fixed: the installed live package exposes the CLI and all public library formats. |
| Verification 2 | Fixed: test coverage and live checks cover focus attribution, invalid actions, origin blocking, offline/update behavior, and headers. |
| Verification 3 and 4 | Fixed: native-image naming and generated-report accessibility are covered; live Axe is clean and visible controls meet the 44 px target rule. |
| Verification 5 | Fixed: the manifest has 14 exact passing commands, the direct demo works, and the versioned download installs. |
| Review 1 (`F-1-1` through `F-1-6`) | Fixed: current navigation focus/announcement, metadata, footer/external-link text, claim coverage, result language, and plain wording all pass. |
| Review 2 (`F-2-1`, `F-1-5`, `F-2-2` through `F-2-9`) | Fixed: the first screen now shows a usable populated demo result, all public claims are declared, terminology and section labels are consistent, headers match, and first-screen facts are present. |
| Review 3 (`F-1-1`, `F-3-1` through `F-3-3`) | Fixed: internal and Back route focus pass without breaking cold-load Tab order; every documented exit-code class is tested; public terminology and copy inventory pass. |
| Verification 7 | Fixed: fresh load leaves focus at the document so the first Tab reaches Skip. |
| Verification 8 and 9 | Reconfirmed: candidate/package identity, full suite, claims, live browser, privacy, offline, accessibility, and legal-route checks remain green. |

This static npm library has no backend, account, tenant data, mutable server
state, health endpoint, or rate-limited endpoint. Backend isolation, restart,
health, and 429 checks therefore do not apply.

## Remaining external step

The factory may publish the prepared package to the npm registry when ready.
That external release action is outside this review and does not affect the
working documented HTTPS package download.
