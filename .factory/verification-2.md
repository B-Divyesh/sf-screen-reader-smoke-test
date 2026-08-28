# Independent verification 2 — FAIL

Date: 2026-08-28
Work order: `screen-reader-smoke-test-verify-2`
Candidate: `a75ee78246e52e3c0e6f6bbf1cfff2d457ba5938`
Live URL: <https://screen-reader-smoke-test.sociobot.in/>
Artifact: npm library/CLI plus static documentation PWA

## Release decision

**FAIL.** The prior npm-bin defect is repaired and the live deployment exactly
matches this candidate, but fresh end-to-end testing found false transcript
data in an ordinary form flow. Announce Check replaces rapidly superseded focus
events with the element focused later, so a reviewed contract can omit the
buttons a user actually focused. Runtime config validation also accepts an
unknown action as a successful no-op. These are false-green failures in the
primary job-to-be-done, not deployment-only issues.

## Defects

### P1 — focus events are attributed to the wrong elements

A packed consumer ran a representative signup flow: submit an empty form,
recover by entering a valid email, and submit again. The page's raw `focusin`
sequence, independently observed with Playwright, was:

```text
BUTTON:Create account
INPUT:Email address
BUTTON:Create account
H2:Confirmation
```

Announce Check instead recorded these focus events:

```text
Email address — textbox
Email address — textbox — required — invalid
Confirmation — heading
Confirmation — heading
```

Both `Create account` button focus events disappeared and the later input and
heading were duplicated. The accompanying assertive validation message and
polite success message were captured, and the filled value was redacted, but
the focus contract itself is wrong.

The cause is in `src/browser.ts`: the exposed binding queues each incoming
focus event, then later calls `frame.locator(":focus").ariaSnapshot()`. When a
submit handler synchronously moves focus, `:focus` is already a different
element. The later snapshot replaces the correct event text that was supplied
by the page observer.

This directly breaks the researched use case of catching an incorrect focus
move in a signup or form flow.

### P1 — an unknown flow action silently passes

This valid JavaScript config typo was accepted:

```js
steps: [{ action: "clik", target: { role: "button", name: "Create account" } }]
```

`announce-check unknown-step.config.mjs --update --json --no-report` exited
`0` and returned `matches: true`, `expected: []`, and `received: []`. It also
wrote an empty approved transcript. A `.mjs` config has no runtime TypeScript
protection; `defineConfig` returns its argument unchanged.

`validateConfig` checks only that `steps` is a non-empty array, and
`performStep` has no rejecting default branch. A misspelled test can therefore
become a green CI check without exercising the business flow. Invalid actions
and every action's required fields need runtime validation and exit code `2`.

### P1 — origin enforcement happens after the outbound navigation

The approved target was `http://127.0.0.1:43971`. A click step activated a link
to a controlled second origin, `http://127.0.0.1:43972/escaped`. The second
server logged `HIT /escaped`; only after that request completed did the CLI exit
`2` with:

```text
Flow left its authorized origin (http://127.0.0.1:43971) and reached
http://127.0.0.1:43972. Add a separate check for that origin.
```

The explicit local/authorized-URL boundary is therefore detection after the
request, not prevention. A navigation or redirect can reach an unapproved
origin without `allowRemote: true`. Enforce the approved origin at request or
navigation time before network transmission.

### P2 — service-worker offline and update guarantees fail outside a warm HTTP cache

Two independent checks failed:

1. After installing the service worker, clearing Chromium's ordinary HTTP
   cache, going offline, and reloading at 390 px, the document returned `200`
   but the CSS and module requests received cached HTML. Chromium reported a
   stylesheet MIME error and a module MIME error; the page was unstyled, the
   sample report did not initialize, and the offline banner remained hidden.
   The worker precaches HTML/image shell entries but omits the hashed CSS and
   JS, then incorrectly falls back to `/` for every failed resource type.
2. After putting a stale shell sentinel at `/` in
   `announce-check-docs-v1`, `registration.update()` reported an activated
   worker with no waiting/installing worker, but reload still showed the stale
   sentinel. The worker is cache-first for documents and does not refresh its
   precache. `sw.js` is byte-identical to the prior deployed candidate even
   though the site CSS changed, and the cache name remains `v1`, so existing
   clients can remain on an old shell indefinitely.

A normal warm-cache offline reload did return `200` and remained interactive;
that success depends on the browser HTTP cache and does not satisfy a durable
PWA offline/update path.

### P3 — not-found responses omit the site's browser security policies

Real pages and assets include CSP, HSTS, referrer policy, and nosniff headers.
`/does-not-exist` correctly returns `404` but includes only `content-type` and
`date`; the global policies are absent on the error response.

## Clean checkout and quality gates

The worktree was clean before verification. `HEAD` and freshly fetched
`origin/main` both resolved to the requested candidate.

| Gate | Fresh result |
| --- | --- |
| `npm ci` | PASS — 95 packages installed; 0 vulnerabilities |
| `npm test` | PASS — 5 files, 8 tests |
| `npm run typecheck` | PASS |
| lint | N/A — no lint script/tool is configured |
| `npm run build` | PASS — produced `dist/library` and `dist/site` |
| `npm pack --dry-run --json` | PASS — 12 files, 41,537 B packed / 182,707 B unpacked |
| `npm audit` | PASS — 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |

The production build used Vite 6.4.3 and tsup 8.5.0 with an ES2022 target.

## Packed consumer and public API

The exact tarball was installed into a new directory with no lockfile. Fresh
checks confirmed:

- `node_modules/.bin/announce-check` is a symlink to the packaged CLI and now
  runs correctly; `--help` and `--version` exit `0` with useful output.
- ESM and CommonJS expose `defineConfig`, `runCheck`, `compareTranscripts`, and
  `renderReport`.
- A strict TypeScript consumer compiled against the shipped declarations.
- The signup flow captured assertive validation and polite success live-region
  events, redacted `qa-secret@example.test` from JSON/transcript/report, wrote
  a local report, and matched on repeat. The incorrect focus rows described
  above make that apparent match unreliable.
- A deliberately changed expected event exited `1`, reported
  `firstDifference: 0`, marked the first difference in HTML, and recovered via
  `--update` followed by a matching run.
- The zero-event boundary (`wait` for `0`) recorded and rechecked an empty
  transcript, with the report's actionable empty state.
- Unknown flags, a missing `--report` value, a missing config, a blocked remote
  URL, an empty steps array, and a missing browser target all exited `2` with
  actionable errors. A filled value did not leak through the browser-error
  JSON path.
- Generated match and empty reports at 1280×800 and 390×844 had one h1, a main
  landmark, no overflow, visible 3 px skip-link focus, no console/page errors,
  no filled value, and 0 serious/critical Axe findings.

## Live identity, site, accessibility, and privacy

The live site is not stale. These SHA-256 values match the fresh candidate
build byte-for-byte:

| Artifact | SHA-256 |
| --- | --- |
| `/` / `dist/site/index.html` | `86bd87edcdea5466b903073c71958ac9d5db80c7d8184f7309754aa10364e9e2` |
| `/sw.js` | `6121114ab15d8074df58fe8287afd32c0405e00bb5c1690d8664cf96638685f7` |
| `/assets/main-BsSEWpA2.js` | `ad647f68a6686d970b17c04e976d8adfed0ec461bc2e2a64ffa0ab41f560837c` |
| `/assets/styles-DFCNwszS.css` | `9aa74ae1cb86163fc001741b89a247d9d7855dec349cadbc33f86e5d696096b6` |
| `/announce-field.webp` | `a79caa314513a05437770c3a2a203ec64138a84e3a017cc354e9bf46dbe7572b` |

Desktop 1280×800 and mobile 390×844 checks found:

- HTTP 200, correct title, `lang=en`, one h1, one main, ordered headings,
  complete image alt text, 16 px body text, and no horizontal overflow.
- Keyboard-only access to the skip link and all four report states; Match,
  Divergence, No events, and Browser error all gave immediate correct state.
- A visible `3px solid #2446d8` focus ring with 3 px offset. Every visible link
  and button measured at least 44×44 CSS px.
- Reduced motion computed 0.01 ms animation/transition durations and
  `scroll-behavior: auto`.
- Axe found 0 serious/critical violations on the home, privacy, and terms pages
  at both viewports. Console errors, page errors, and failed requests were 0 in
  online tests.
- Initial requests were same-origin only. There were no cookies, local/session
  storage entries, IndexedDB databases, analytics, CDN fonts, or third-party
  runtime scripts. Cache Storage contained only the documented PWA cache.
- `/opt/fleet/lib/verify-url.sh` passed: load 573 ms, title/lang/main present,
  one h1, 0 missing alts, 0 unlabeled buttons, and 0 console errors.

Live response policy/caching checks passed for real content:

- CSP: self-only default/image/style/script/connect, with object blocked,
  self-only base, and framing blocked.
- HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and
  `X-Content-Type-Options: nosniff` are present.
- HTML is `public, must-revalidate, max-age=30`; hashed JS/CSS are
  `public, max-age=31536000, immutable`; `sw.js` is `no-cache`.

## Performance

Production assets are below the contract budgets:

- JavaScript: 3,111 B raw / 1.48 kB gzip (budget 200 kB).
- CSS: 10,681 B raw / 3.30 kB gzip (budget 50 kB).
- Hero WebP: 37,324 B (budget 300 kB); no webfonts are shipped.

Lighthouse 12.8.2 mobile against the live URL (second run after an initial
environmental Chromium tab crash) produced:

| Category/metric | Result |
| --- | ---: |
| Performance | 96 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| FCP | 1,063 ms |
| LCP | 1,090 ms |
| TBT | 246.5 ms |
| CLS | 0 |
| Total transfer | 46,411 B |

## Release dependency

`npm view screen-reader-smoke-test version --json` currently returns registry
`E404`; the package is not published. This is an external factory release step,
not a request for a verifier to publish. The tarball is structurally ready, but
the live install command will not work until the factory publishes after the
P1 defects are repaired and reverified.

## Required remediation

1. Bind the accessibility snapshot to the element that emitted each focus
   event, or preserve the observer's correct event identity; add a regression
   where a submit handler synchronously moves focus.
2. Runtime-validate every step discriminant and payload; reject unknown action
   names with exit `2` before opening Chromium.
3. Intercept main-frame navigation/redirect requests and abort unapproved
   origins before transmission.
4. Version and refresh the service-worker cache, precache generated JS/CSS,
   use type-appropriate failure behavior, and test update plus offline reload
   after clearing the HTTP cache.
5. Apply browser security headers to error responses, then rerun independent
   verification before publishing.
