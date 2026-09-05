# Independent verification 9 — PASS

Date: 2026-09-05 UTC
Work order: `screen-reader-smoke-test-verify-9`
Live URL: <https://screen-reader-smoke-test.sociobot.in/>
Implementation candidate: `69d37616d7f72049a1aa6dd7c6b9800fec20af79`
Documentation candidate: `88c19fc0ca8e4886cfa3f40be3fa6e4215f244ea`

## Verdict

**PASS — zero findings and zero untested public claims.** The deployed site
and versioned package match the implementation candidate. All required
end-to-end paths, declared claims, library-consumer checks, accessibility,
privacy, offline, and site-structure checks passed independently.

## Job, audience, and first action

The first screen states: “Catch changed keyboard focus and status messages.”
It names small web teams checking one critical form flow before release and
offers “Try it with sample data.” Its adjacent text says that it loads a
sample event list and shows the first change. This is clear at 1280 × 800 and
an iPhone 13 viewport (390 × 844), before scrolling.

## Clean checkout and claims

I created a detached clean checkout at the documentation candidate, ran
`npm ci` (95 packages, 0 vulnerabilities), and ran every exact command in
`.factory/claims.json`. All 14 passed, with no missing command or unmatched
claim tag:

| Claims passed |
| --- |
| `demo-first-difference`, `local-private-flow`, `site-no-tracking`, `offline-demo`, `download-package`, `cli-exit-codes`, `ci-recheck` |
| `cli-output-modes`, `build-artifacts`, `local-site`, `origin-boundary`, `workflow-steps`, `package-formats`, `mit-license` |

The complete clean suite also passed: `npm test` (9 files, 32 tests),
`npm run lint`, `npm run build`, `npm pack --dry-run --json --ignore-scripts`,
and `git diff --check`. The build produced `dist/library` and `dist/site`.
The site assets are within the static budget: home JavaScript 1.19 kB gzip,
demo JavaScript 1.28 kB gzip, and CSS 4.01 kB gzip.

## Package consumer and deployment identity

The live versioned tarball installed into a separate empty Node project. Its
ESM exports were `compareTranscripts`, `defineConfig`, `eventToLine`,
`renderReport`, and `runCheck`; `npx announce-check --help` ran successfully.
The live tarball and clean-candidate tarball have the same SHA-256:

`f496ee5d30bd7c508faead12c69b818edd51846a4d3bef6ffee413e9d5e1b025`.

This confirms the deployed package corresponds to implementation
`69d37616d7f72049a1aa6dd7c6b9800fec20af79`. The documentation-only commit is
`88c19fc0ca8e4886cfa3f40be3fa6e4215f244ea`.

## Live browser verification

Fresh desktop and iPhone 13 Playwright contexts passed all of the following:

- Cold-load first Tab reaches “Skip to main content.” The home page has the
  expected title, `lang="en"`, one `h1`, and one `main`.
- The primary action opens `/demo/?demo=1` in one click. The populated sample
  immediately shows event 3 (`Account created` versus `Check your inbox`),
  and the persistent label says “Demo — sample data, nothing is saved.”
- Editing the received list to match produces “No differences found.” Invalid
  input produces the specific format error and Reset restores the shipped
  sample. Enter runs comparison and Space activates Reset.
- The sample writes no cookies, localStorage, sessionStorage, or IndexedDB
  data. Seven observed demo-flow requests were all same-origin.
- Internal Privacy navigation and Back each focus the destination `h1` and
  update the polite route announcement, while cold-load Skip order remains
  correct.
- After one online visit, a fresh phone context reloaded `/demo/?demo=1`
  offline. The offline notice and populated sample remained available, with
  no console error.
- All visible links and buttons measured at least 44 CSS px high. The
  reduced-motion media query is honored; transitions reduce to 0.01 ms.

No console errors or failed requests occurred in either normal browser flow.

## Accessibility, routes, links, and privacy

`@axe-core/playwright` found **0 serious or critical violations** at desktop
and phone sizes for `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`, and
`/missing-verify-9`. Each returned exactly one `h1` and one `main`, with no
horizontal overflow. Route titles were correct. The missing route deliberately
returned the product's styled HTTP 404 and is not a defect.

All seven resolved internal/download/external links returned HTTP 200. The
live response has a self-only CSP, HSTS, `nosniff`, and strict-origin referrer
policy. `robots.txt` and `sitemap.xml` are present; the sitemap lists home,
demo, privacy, and terms. The demo request audit found no third-party request,
analytics, cookie, or personal browser storage.

## Earlier finding disposition

| Earlier record | Current disposition and independent evidence |
| --- | --- |
| Original verification | Fixed: installed live package exposes and runs the CLI; clean packed-consumer and all-package tests pass. |
| Verification 2 | Fixed: the full 32-test suite covers focus attribution, invalid actions, pre-navigation origin blocking, worker offline/update behavior, and response policy; live offline and headers also passed. |
| Verification 3 and 4 | Fixed: full tests cover native-image accessible names and generated-report Axe/contrast; live Axe is clean and measured controls meet the touch-target rule. |
| Verification 5 | Fixed: manifest exists with 14 exact passing commands; direct one-click demo and live versioned package download both work. |
| Review 1 and 2 (`F-1-1` through `F-2-9`) | Fixed: current live first read, first-screen facts, populated demo, plain result wording, shared header/footer, metadata, legal routes, and claim inventory passed. |
| Review 3 (`F-1-1`, `F-3-1` through `F-3-3`) | Fixed: live internal/Back heading focus and announcement pass without changing cold-load Tab order; packed CLI exercises all documented exit-code classes; public wording and copy-inventory tests pass. |
| Verification 7 | Fixed: a fresh page leaves focus at the document, so the first Tab reaches Skip. |

No backend checks apply: this is a static npm library and documentation site
with no tenant, sign-in, mutable server data, health endpoint, or rate limit.

## Remaining external step

The factory may publish the prepared package to the npm registry when it is
ready. That registry action is outside this verification and does not affect
the working documented HTTPS tarball or any product claim.
