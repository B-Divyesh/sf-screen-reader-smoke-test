# Repair handoff — repair pushed; static rollout pending

Date: 2026-08-28
Work order: `screen-reader-smoke-test-repair-2`
Base verified: `a75ee78246e52e3c0e6f6bbf1cfff2d457ba5938`
Artifact: TypeScript npm library/CLI with static documentation PWA

## Repaired release blockers

- Focus transcript capture now records the semantic text captured during the
  original `focusin`; it no longer queues a later `:focus` snapshot that can
  replace a submit button with a synchronously focused invalid input or heading.
  Native headings now retain their accessible name and `heading` role.
- Runtime configuration validation now rejects every unsupported action and
  malformed action payload before Chromium launches. `defineConfig` validates
  too, so JavaScript/MJS configs receive the same protection. The misspelled
  `{ action: "clik" }` path exits `2` rather than writing an empty approved
  transcript.
- Main-frame navigations are routed and aborted before network transmission
  when they leave the configured origin, including link clicks and redirects.
- The static build generates a content-addressed service-worker cache name
  from the worker source and current Vite assets. It precaches generated CSS
  and JS, uses network-first documents for online refreshes, cache-first assets
  offline, and never returns the HTML shell for a missing CSS/JS request.
- A real `404.html` plus Static Web Apps response override makes not-found
  pages receive the configured CSP, HSTS, referrer policy, and `nosniff`
  headers through the normal static response path.

## Regression coverage

- `test/browser.test.ts` reproduces synchronous invalid-form recovery and
  asserts `button → input → button → heading` focus ownership. It also asserts
  the controlled second origin receives zero requests.
- `test/config.test.ts` exercises `clik` through the CLI and malformed fill,
  press, and wait payloads.
- `test/site.test.ts` builds the production site, verifies every generated
  asset is precached, clears Chromium's HTTP cache, reloads offline at 390 px,
  then installs a changed worker over a stale `/` sentinel and verifies the
  old cache is removed and the fresh document wins. It also runs Axe at desktop
  and 390 px.

## Verification evidence

Run from a clean `npm ci` installation:

| Check | Result |
| --- | --- |
| `npm ci` | 95 packages installed; `npm audit` reported 0 vulnerabilities |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 6 files, 12 tests |
| `npm run build` | PASS — `dist/library` and `dist/site` produced |
| `node --check dist/site/sw.js` | PASS |
| `npm pack --dry-run --json` | PASS — 49,185 B tarball / 211,451 B unpacked, 12 files |
| `npm audit` / `npm audit --omit=dev` | PASS — 0 vulnerabilities in both |
| Packed consumer | PASS in `test/package.test.ts`: npm-bin symlink, update/recheck, and filled-value redaction |
| Browser/Axe | PASS at 1280×800 and 390×844; 0 serious/critical violations and no console/page errors |
| Offline/update | PASS after clearing Chromium HTTP cache; generated asset precache and stale-cache replacement covered by browser test |
| Local `verify-url.sh` | PASS — 524 ms load, title/lang/one h1/main/alt/button checks and 0 console errors |

Production asset sizes: JS 3,111 B, CSS 10,681 B, hero WebP 37,324 B.

Lighthouse 12.8.2 against the built local site produced Performance 100,
Accessibility 100, Best Practices 100, SEO 100, LCP 1,203 ms, CLS 0. The
Chromium process reported a post-report tab crash while Lighthouse cleaned up;
the JSON report was written with those scores, and the independent Playwright
and Axe browser checks above passed cleanly.

## Deployment and release notes

The repository's deployment class remains static. Repair commit
`8f029300adabc9c515fdd6e2c30d62738da7208d` was pushed to `main` at 04:37 UTC.
That is the complete in-repository deployment path; no deploy credentials or
deployment configuration are present, and `AGENTS.md` assigns the actual static
deployment to the factory.

Live check at 04:39 UTC confirms that the factory rollout has **not yet
propagated**: the live worker SHA-256 is still
`6121114ab15d8074df58fe8287afd32c0405e00bb5c1690d8664cf96638685f7`, while
this repair builds `sw.js` as
`35618b3f9ecdea2a839b416f64c7e306484273062094608ced7f3c15de9ef665`.
`/does-not-exist` likewise still returns only `content-type`, proving it is the
prior deployment rather than this repair. The live HTML and hashed JS/CSS were
unchanged by this repair and therefore still match their prior build hashes.

After factory rollout, verify the new worker hash, a 404 response carrying CSP,
HSTS, referrer policy, and `nosniff`, then repeat the cold-cache offline test
against <https://screen-reader-smoke-test.sociobot.in/>.

Do not publish the npm package from this worker. The ready-to-publish command
for the factory-owned registry credentials is `npm pack`; the package remains
at version `0.1.0`.

## Known gaps / next step

No product-code blockers remain locally. The npm registry release and the
factory-hosted deployment are external release steps; the only remaining item
is propagation of the static deployment, followed by live verification and the
factory-owned registry release.
