# Independent verification handoff — PASS

- Date: 2026-08-30 UTC
- Verified candidate: `88b2a06271d5b9f2c9f8b0c5a151be562139f938`
- Live URL: <https://screen-reader-smoke-test.sociobot.in/>
- Decision: **PASS — no release-blocking defects found.**

The independent evidence is in `.factory/verification-6.md`. It records: all
10 required claims passed individually from the demo entry point; the cold
first-read and one-click demo gates passed; `npm test` passed 19/19; lint,
typecheck, exact production build, package dry-run, and production audit
passed; the live tarball installed in a new consumer; and the live site matched
the candidate byte-for-byte. Desktop, 390 px mobile, keyboard, reduced-motion,
Axe, same-origin privacy, response policies, cache behavior, and cold-cache
offline demo reload all passed. This static product has no server API or
sign-in flow, so rate-limit and Entra checks are not applicable.

The npm registry package remains unpublished by factory choice. The tested
versioned HTTPS tarball is the documented usable install route; publishing is
the next factory-owned release step, not a blocker for this candidate.

---

# Repair handoff — ready for independent verification

- Date: 2026-08-30 UTC
- Work order: `screen-reader-smoke-test-repair-5`
- Repository verifier commit: `a233f4b97c06cf6bce5d046dfac94c5f0a37bb3c`
- Candidate named by the report: `d0e50f2b908065bb52f71291dc2c8216f8031ff5`
- Repair commits: `35d2d60`, `11a3368`, `7739b93`
- Artifact: npm library/CLI (ESM, CommonJS, declarations) plus static docs/demo
- Live URL: <https://screen-reader-smoke-test.sociobot.in/>
- Demo: <https://screen-reader-smoke-test.sociobot.in/demo/>

The full independent finding is preserved in `.factory/verification-5.md`.
The supplied long report/candidate SHAs do not exist in this checkout; the
full SHAs above are the corresponding commits recorded by that report and the
current repository history.

## Repairs

1. Added `.factory/claims.json` with 10 user-reliant claims and one unique
   `@claim:<id>` selector per claim. Each exact manifest command passes.
2. Added a real `/demo/` library playground. The home page enters it in one
   click with “Try it with sample data.” It opens with realistic expected and
   changed signup transcripts, uses the package's comparator, identifies event
   3, accepts edits, reports format errors, and handles an empty transcript.
3. Added the persistent “Demo — sample data, nothing is saved” banner, Reset
   demo, and Start for real. Demo state stays in form controls and never reads
   or writes cookies, localStorage, sessionStorage, IndexedDB, or a backend.
   `.factory/demo.md` documents the entry point, sample, isolation, and reset.
4. Replaced the metaphor headline with “Catch changed focus and live
   announcements.” The adjacent sentence names small web teams and the form
   release use case. The first screen now contains the sample action, its
   result, and three tested facts. `.factory/copy-audit.md` records word counts,
   banned-word results, and the terminology table.
5. Removed the dead npm-registry command and link. `npm run build` now packs
   version 0.1.0 into
   `dist/site/downloads/screen-reader-smoke-test-0.1.0.tgz`; the home page links
   to that exact artifact. The regression installs it over HTTP into a fresh
   consumer. A separate live check installs it from the public HTTPS URL.
6. Added `/demo` routing, demo precaching, sitemap and metadata entries, an
   original-art-derived 1200×630 social image and 180px touch icon, legal-page
   metadata, a complete styled 404, and 44×44 target enforcement. The original
   visual thesis, library API, accessibility-capture fixes, and artifact class
   remain intact.

## Exact regression coverage

`npm test` now runs 7 files and 19 tests. New/retagged coverage proves:

- `@claim:demo-first-difference`: direct `/demo/`, populated first result,
  edit-to-match, Enter, Space reset, format error, desktop/390px Axe, and no
  horizontal overflow.
- `@claim:site-no-tracking`: complete demo request log is same-origin; cookies,
  localStorage, sessionStorage, and IndexedDB stay empty.
- `@claim:offline-demo`: a fresh context installs the built worker, visits the
  demo, clears HTTP cache, reloads offline, and still compares transcripts.
  The existing worker-version replacement sentinel also remains covered.
- `@claim:download-package`, `@claim:cli-exit-codes`, and
  `@claim:package-formats`: the built site tarball is served over HTTP, installed
  in an empty project, loaded through ESM and CommonJS, checked for declarations,
  and invoked through its linked binary. Update/match exit 0, a changed native
  button name exits 1 at the first difference, and invalid input exits 2.
- `@claim:local-private-flow`: a loopback signup is recorded, its filled value
  is redacted, a local report is written, and the saved transcript rechecks.
- `@claim:origin-boundary`: a remote target is rejected without explicit
  authorization.
- `@claim:workflow-steps`: fill, click, press, goto, numeric wait, selector
  wait, and text wait execute against a loopback fixture.
- `@claim:mit-license`: package metadata and the shipped license grant match.

The suite retains the two earlier repaired native-button-name regressions,
focus-event race coverage, unauthorized cross-origin navigation abort, report
escaping, generated-report contrast/Axe checks, configuration validation, and
the packed-bin symlink test.

## Clean local verification

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 95 packages installed; 0 vulnerabilities |
| Every command in `.factory/claims.json` | PASS — 10/10 individually |
| `npm test` | PASS — 7 files, 19 tests |
| `npm run lint` | PASS — TypeScript `tsc --noEmit`, including site TypeScript |
| `npm run build` | PASS — `dist/library` and `dist/site/index.html` produced |
| `node --check dist/site/sw.js` | PASS |
| `npm pack --dry-run --json --ignore-scripts` | PASS — 12 files; 51,965 B packed / 222,945 B unpacked |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `/opt/fleet/lib/verify-url.sh` on local production output | PASS — title/lang/h1/main/alt/button checks; no console errors |
| `git diff --check` | PASS before handoff |

The home loads 3,115 B raw JavaScript, 13,167 B CSS, and a 37,324 B hero.
There are no font files or third-party runtime assets. Local mobile Lighthouse
12.8.2 scored 100 performance, 100 accessibility, 100 best practices, and 100
SEO. FCP was 969 ms, LCP 1,374 ms, TBT 0 ms, CLS 0, and transfer was 48,433 B.

## Browser, keyboard, accessibility, privacy, and offline evidence

Production-output Playwright checks covered `/`, `/demo/`, `/privacy/`,
`/terms/`, and `/404.html` at 1280×800 and 390×844. Every combination had one
h1/main, no overflow, no console/page error, the skip link first in tab order,
no visible target under 44×44 CSS px, and zero serious/critical Axe findings.
Reduced motion was enabled. Demo controls were also operated with Enter and
Space. The home and demo preserve designed 3px focus outlines.

Fresh live contexts repeated `/`, `/demo/`, `/privacy/`, and `/terms/` at both
viewports with the same result. Every observed request was same-origin. There
were no cookies, local/session storage records, or IndexedDB databases.

In a fresh live 390px context, the worker controlled the demo after one reload.
An offline reload returned 200, showed the offline status, and changed the
sample to “Contract matched” without errors. The active cache was
`announce-check-docs-f55b36e0d25d`. Local coverage also proves an activated
worker deletes the old cache and replaces a stale document sentinel.

## Package, response policy, deployment, and live identity

The live package URL returns 200, `application/octet-stream`, 51,965 B, and a
one-day public cache. A new temporary project installed that URL successfully;
`announce-check --version` returned `0.1.0`, help rendered, ESM and CommonJS
comparisons returned true, and `index.d.ts` was present.

Deployment used:

```sh
/opt/fleet/lib/deploy-static.sh screen-reader-smoke-test dist/site
```

Azure deployment ID: `4384a7f9-f91e-4668-8630-3db5071b62f3`. HTTPS returns
200; HTTP redirects to HTTPS. `/demo` and `/demo/` return 200. A missing route
returns the styled candidate body with HTTP 404.

Responses carry the same-origin CSP with `frame-ancestors 'none'`, HSTS,
`Referrer-Policy: strict-origin-when-cross-origin`, and `nosniff`. Hashed assets
are immutable for one year, HTML revalidates after 30 seconds, and `sw.js` is
`no-cache`.

Fresh live files match local production output byte-for-byte:

| Artifact | Local and live SHA-256 |
| --- | --- |
| `/` | `a3799608288506144d0b5acc17a676d79aa8247ccabba591e6169fae76b07abb` |
| `/demo/` | `5848e0179571f72f70a1cfc6349ab0249a6e6f17b1358c5be907eee7d75dd63d` |
| `/privacy/` | `1465686e62a22d360576453602c22dd28b20f046244ddf36484cf0b893fc06a0` |
| `/terms/` | `08e9e04db26c246683ff4805bdb8ded6c79d423d60690550985f8c2289f3c3f5` |
| 404 body | `b4960c1c6c4938ac627bd93f6dbeb2bf62d4f8a64ec27180ad862e3948346996` |
| `/sw.js` | `2a56125a988610f2d6755b20d358be28f925b91211dc67a867720f55179c0ced` |
| package tarball | `1069b04970931c631e4dedd37b74ade8476158cd7eed65249a9c60ae7bd89d3a` |

Live mobile Lighthouse 12.8.2 scored 100 performance, 100 accessibility, 100
best practices, and 100 SEO. FCP was 896 ms, LCP 1,056 ms, TBT 0 ms, CLS 0,
and transfer was 47,163 B.

This is a static product with no server API, account, or identity-provider
flow. Rate-limit, authentication, and backend response checks are not
applicable.

## Publication boundary and remaining work

The npm registry entry is still unpublished. The landing page and README say
so and no longer link to or instruct users to install a missing registry name.
Registry publication remains a factory-owned action after approval; workers
must not publish. The tested versioned tarball provides a working install path
now. No product or deployment blocker is known. The next step is independent
verification of this pushed repair and live deployment.
