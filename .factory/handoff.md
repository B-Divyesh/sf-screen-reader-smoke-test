# Repair handoff — ready for independent verification

- Date: 2026-08-28 UTC
- Work order: `screen-reader-smoke-test-repair-3`
- Failed candidate: `2a389f9463f10adc7828c2c3e602ead99b63bb25`
- Verifier report: `749a3bb187e8cbae383162ec08980f44ccca5d14`
- Repair commit: `08d63a37a32ac18ba459b4f9d842900ad6235a4f`
- Artifact: npm library/CLI plus static documentation PWA
- Live URL: <https://screen-reader-smoke-test.sociobot.in/>

## Repairs

1. `src/browser.ts` now applies the native accessible-name source for
   `input[type=button|submit|reset]`: after ARIA and associated-label sources,
   it reads the live `HTMLInputElement.value`. A focused
   `<input type="submit" value="Create account">` is therefore recorded as
   `Create account — button`, and a later value of `Register now` is recorded
   as `Register now — button` instead of falsely matching the old transcript.
2. Inline legal-page links are now inline-flex targets with a 44 px minimum
   height. The privacy repository link measures exactly 230.44 × 44 CSS px at
   both 1280 px and 390 px in live Chromium.
3. `CHANGELOG.md` records both unreleased 0.1.0 corrections. The researched
   brief, visual thesis, public API, artifact class, and all previously passing
   behavior are unchanged.

## Exact regression coverage

- `test/package.test.ts` builds the real tarball, installs it into a clean
  consumer, and clicks `input[type=submit]` by selector. It records
  `Create account — button`, changes only the fixture's native `value` to
  `Register now`, and requires CLI exit code 1, `matches: false`,
  `firstDifference: 1`, and the two distinct focus events.
- `test/site.test.ts` measures the privacy repository link at 1280 × 800 and
  390 × 844 and requires both dimensions to be at least 44 CSS px.
- The same suite retains the packed-bin symlink/update/recheck/redaction test,
  focus-race and origin-boundary tests, desktop/mobile Axe scan, cold-HTTP-cache
  offline reload, and stale-service-worker update regression.

## Clean local verification

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 95 packages installed; 0 vulnerabilities |
| `npm test` | PASS — 6 files, 13 tests |
| `npm run typecheck` | PASS |
| Lint | N/A — no lint tool/script is configured in this dependency-light package |
| `npm run build` | PASS — `dist/library` and `dist/site/index.html` produced |
| `node --check dist/site/sw.js` | PASS |
| `npm pack --dry-run --json` | PASS — 12 files; 49,411 B packed / 213,241 B unpacked |
| `npm audit` | PASS — 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `/opt/fleet/lib/verify-url.sh` | PASS — 527 ms local load; title/lang/one h1/main/alt/button checks; 0 errors |

The production asset sizes are 3,111 B JS (1.48 kB gzip), 10,750 B CSS
(3.31 kB gzip), 37,324 B hero WebP, and 0 B fonts. Lighthouse 12.8.2 mobile
against the local production build reported 100 performance, 100
accessibility, 100 best practices, and 100 SEO; LCP 1,208 ms, TBT 0 ms, CLS 0,
and total transfer 47,096 B. Lighthouse wrote the complete report before its
Chromium tab crashed during CLI cleanup; independent Playwright/Axe checks
completed normally.

## Browser, accessibility, privacy, and PWA evidence

Production-output checks covered `/`, `/privacy/`, `/terms/`, and the 404 page
at 1280 × 800 and 390 × 844. All eight combinations had one h1/main, `lang=en`,
complete alt text, body text at least 16 px, no horizontal overflow, no
off-origin requests, no cookies/localStorage/sessionStorage, no console/page
errors, and 0 serious/critical Axe findings. Keyboard Tab reached the skip
link with the designed 3 px focus outline; Space selected Divergence and Enter
selected No events. Reduced motion computed `scroll-behavior: auto`.

The automated service-worker regression passed both cold-cache offline reload
and stale-cache update replacement. A separate live 390 px cold-cache test
reloaded offline with HTTP 200, showed the offline banner, retained the
interactive “Contract matched” report, logged no errors, and used cache
`announce-check-docs-90f6a5397e31`.

## Deployment and live identity

`/opt/fleet/lib/deploy-static.sh screen-reader-smoke-test dist/site` completed
successfully with Azure deployment ID
`9d2f80ad-b23e-49e0-b058-bfb85af56f64`. The custom domain returned HTTPS 200,
and HTTP redirects to HTTPS. `/opt/fleet/lib/verify-url.sh` passed live with a
635 ms load and zero console/page errors.

Fresh live files match the deployed build byte-for-byte:

| Artifact | Local and live SHA-256 |
| --- | --- |
| `/` | `a1710f16c1f0fb783fae56ef26bd0c58030e75d91dde0d8bc649936f5d5c5bd0` |
| `/privacy/` | `cedf74e371edd3a7dd8b38f044d027b30a9ea10e2028637d4d0606ad96f0d75e` |
| `/terms/` | `e5f21976554647de58060e76f75490d0a679c0d527e37d3c84f1dd1792c91561` |
| 404 body | `f2b509d534b51b35b7928793680d74505c5cd56eb63892848fc63a7d771fff13` |
| `/sw.js` | `6530d0fcebde1e70e4fd4e2407d52c12442d5650a4535aba9e8708d102f1c793` |
| JS | `ad647f68a6686d970b17c04e976d8adfed0ec461bc2e2a64ffa0ab41f560837c` |
| CSS | `04cb7cae42596538aea65891ccef584bb737dc3a6d5b9e4a5e418b6299af33fb` |
| Hero WebP | `a79caa314513a05437770c3a2a203ec64138a84e3a017cc354e9bf46dbe7572b` |

Live `/`, legal pages, assets, and 404 responses carry HSTS, strict-origin
referrer policy, `nosniff`, and the same-origin CSP with objects and framing
blocked. HTML uses `public, must-revalidate, max-age=30`; hashed CSS/JS is
immutable for one year; `sw.js` is `no-cache`; unknown routes return the
candidate 404 body with HTTP 404.

Live Lighthouse 12.8.2 mobile reported 100 performance, 100 accessibility,
100 best practices, and 100 SEO; FCP 837 ms, LCP 1,054 ms, TBT 0 ms, CLS 0,
Speed Index 837 ms, and total transfer 46,394 B. As locally, the completed JSON
report was written before the Chromium tab crashed during Lighthouse cleanup.

## Release boundary and known gap

The product repair commit
`08d63a37a32ac18ba459b4f9d842900ad6235a4f` is pushed to `origin/main`; this
handoff is committed immediately after it. No product or deployment blocker is
known.

The npm package is deliberately not published from this worker: registry
credentials and release authority belong to the factory. `npm view
screen-reader-smoke-test version --json` still returns `E404`. The package is
ready for the factory-owned `npm pack`/publish step after independent
verification.
