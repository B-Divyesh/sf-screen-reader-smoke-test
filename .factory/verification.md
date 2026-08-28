# Independent verification — FAIL

Date: 2026-08-28  
Candidate: `2f9fcd8bb0581e9c098e6be3a73ab93a779e7390`  
Live URL: <https://screen-reader-smoke-test.sociobot.in/>

## Release decision

**FAIL.** The publishable npm CLI—the product's primary documented workflow—does
not execute after a clean consumer installation. This prevents a team from
recording or checking a transcript with `npx announce-check`.

### Defects

1. **P0 / release blocker — installed `announce-check` binary is a silent no-op.**
   - Reproduced from a clean consumer at `/tmp/announce-qa/consumer` after
     `npm install /work/repo/screen-reader-smoke-test-0.1.0.tgz`.
   - `node_modules/.bin/announce-check --help` exited successfully with no
     output. `--version` likewise produced no output.
   - `node_modules/.bin/announce-check announce-check.config.mjs --update --json`
     exited without output and did not create `announce-check.expected.json`.
   - Running the underlying real file directly,
     `node node_modules/screen-reader-smoke-test/dist/library/cli.js --help`,
     prints the help text; its direct normal flow records and then matches a
     transcript, and its remote-target refusal returns the documented JSON
     error. This isolates the failure to the npm bin entrypoint, not the runner.
   - Cause visible in `src/cli.ts`: invocation depends on an exact comparison
     between `import.meta.url` and `pathToFileURL(resolve(process.argv[1]))`.
     npm exposes the bin as a `.bin` symlink, so those paths do not compare
     equal and `main()` is never called.

2. **P2 — several visible footer links are below the stated 44 px touch-target
   minimum.** At both desktop and 390 px the Privacy, Terms, and Source links
   are about 21.7 CSS px high (Terms is about 42 px wide). This misses the
   product and accessibility work-order target, although the links remain
   keyboard reachable.

## What passed

### Clean checkout and package gates

The worktree was clean at the requested SHA before verification. No product
source was changed.

```sh
npm ci
npm test
npm run typecheck
npm run build
npm pack --dry-run
npm audit
npm audit --omit=dev
```

- `npm ci`: installed 95 packages; audit reported 0 vulnerabilities.
- `npm test`: passed, 4 files / 7 tests. It exercised a local signup flow,
  redaction, comparison, report escaping, remote refusal, and a basic site axe
  scan.
- `npm run typecheck`: passed.
- `npm run build`: passed and produced `dist/library` plus `dist/site`.
- `npm pack`: produced `screen-reader-smoke-test-0.1.0.tgz`, 41,436 bytes
  compressed / 182,603 bytes unpacked, with ESM, CJS, declarations, CLI,
  README, CHANGELOG, and MIT license.
- There is no lint script configured in `package.json`.

The consumer test also verified the public ESM and CommonJS API exports
(`defineConfig`, `runCheck`, `compareTranscripts`, and `renderReport`). A
direct invocation of the packaged CLI successfully updated and rechecked a
representative local sample-report flow; the standard npm bin invocation did
not, which is why the overall result remains FAIL.

### Production site, privacy, and accessibility

Using Playwright against the actual production URL and the candidate production
build:

- Desktop (1280×800) and mobile (390×844) both switched the sample report to
  divergence via keyboard, had a visible 3 px focus outline on the active demo
  control, and had no horizontal overflow at 390 px. The skip link was visibly
  focused at 390 px.
- Axe found **0 serious or critical** violations at both sizes. There were no
  console errors or page errors.
- A reduced-motion context computed 0.01 ms animation/transition durations and
  `scroll-behavior: auto`.
- Initial-page requests were same-origin only; the page has no analytics,
  third-party fonts, scripts, or storage beyond its documented service-worker
  cache. The direct CLI remote-url validation rejected `https://example.com`
  unless explicitly authorized.
- With a controlled service worker, an offline reload of the live page returned
  HTTP 200 from cache, displayed the offline banner, and the sample-report
  control still changed state.

The live response matches the candidate byte-for-byte for these artifacts:

| Artifact | SHA-256 |
| --- | --- |
| `/` / `dist/site/index.html` | `7ee533398c15a8e8404b530a24da998a32d8b04a785c49d7ce3ecfaee67c377a` |
| `/sw.js` | `6121114ab15d8074df58fe8287afd32c0405e00bb5c1690d8664cf96638685f7` |
| `/assets/main-BEiLT1kj.js` | `ad647f68a6686d970b17c04e976d8adfed0ec461bc2e2a64ffa0ab41f560837c` |
| `/assets/styles-B8y_bOSh.css` | `ce7501cdaae226d2f458faee6f35dd7b4b08e394c9e5d93ff18e2fd9ef219948` |
| `/announce-field.webp` | `a79caa314513a05437770c3a2a203ec64138a84e3a017cc354e9bf46dbe7572b` |

Live headers include the expected self-only CSP, HSTS,
`Referrer-Policy: strict-origin-when-cross-origin`, and
`X-Content-Type-Options: nosniff`. Hashed JS and CSS are
`public, max-age=31536000, immutable`; `sw.js` is `no-cache`.

The built initial JS is 3,111 bytes raw (1,480 gzip), CSS is 10,569 bytes raw
(3,280 gzip), and the hero WebP is 37,324 bytes—within the stated budgets.

## Required remediation and re-verification

Fix the CLI entrypoint so npm's symlinked `bin` invokes `main()` reliably; add
a clean `npm pack` consumer test covering `announce-check --help`, `--update`,
and a matching recheck. Increase the footer link hit areas to at least 44×44
CSS px. Re-run the clean consumer installation and full verification before
release.
