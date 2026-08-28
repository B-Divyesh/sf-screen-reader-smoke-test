# Independent verification 3 — FAIL

- Date: 2026-08-28 UTC
- Work order: `screen-reader-smoke-test-verify-3`
- Candidate: `2a389f9463f10adc7828c2c3e602ead99b63bb25`
- Live URL: <https://screen-reader-smoke-test.sociobot.in/>
- Artifact: npm library/CLI plus static documentation PWA

## Release decision

**FAIL.** The candidate is cleanly buildable, the prior deployment-only gap is
resolved, and the previous focus-race, runtime-validation, origin-boundary,
service-worker, and 404-policy repairs all pass fresh tests. However, an
independent packed-consumer test found another false green in the core job:
Announce Check does not record the accessible name of a native
`<input type="submit">`. A real accessible-name change therefore passed the
announcement contract with exit code `0`. The privacy page also misses the
explicit 44 px touch-target requirement for its inline repository link.

## Defects

### P1 — native input buttons lose their accessible name and can false-green

A clean consumer installed the packed candidate and exercised this ordinary
signup control:

```html
<input type="submit" value="Create account">
```

The flow used the supported selector target `input[type=submit]`. Chromium's
own accessibility snapshot was:

```text
- button "Create account"
```

Announce Check instead recorded:

```json
{"kind":"focus","text":"button","step":1}
```

The fixture's value was then changed to `Register now`. Chromium's snapshot
correctly changed to `- button "Register now"`, but Announce Check again
recorded `button`; comparison exited `0` with `matches: true` against the old
transcript. This is a demonstrated false green for a common form control in the
brief's primary signup/form use case.

The cause is `src/browser.ts:134-159`: `nameOf` checks associated labels for all
inputs, but never uses the `value` accessible-name source for input types
`submit`, `button`, or `reset`. It then excludes input elements from the
text-content fallback. `roleOf` correctly calls the element a button, which is
why the misleading event is simply `button`.

Required remediation: derive each focused element's name/role/state from the
browser accessibility tree or implement and test the relevant native accessible
name rules. Add a regression that records by selector, changes a native input
button's `value`, and requires a mismatch.

### P2 — privacy-page repository link is below the 44 px target contract

The inline `public source repository` link on `/privacy/` has no target-size
styling. Fresh Chromium geometry was:

| Viewport | Bounding box | Actual line-fragment hit boxes |
| --- | ---: | --- |
| 1280 px | 643.31 × 42.80 px | 124.83 × 18 px and 96.02 × 18 px |
| 390 px | 288.06 × 42.80 px | 124.83 × 18 px and 96.02 × 18 px |

All other visible links/buttons met 44 × 44 px. Axe correctly does not flag this
project-specific 44 px requirement, but the supplied accessibility and design
contracts require it.

## Clean checkout and quality gates

The initial worktree was clean. `HEAD`, freshly fetched `origin/main`, and the
requested candidate all resolved to
`2a389f9463f10adc7828c2c3e602ead99b63bb25`.

| Gate | Fresh result |
| --- | --- |
| `npm ci` | PASS — 95 packages installed; 0 vulnerabilities |
| `npm test` | PASS — 6 files, 12 tests |
| `npm run typecheck` | PASS |
| lint | N/A — no lint command/tool is configured |
| `npm run build` | PASS — exact production build created `dist/library` and `dist/site` |
| `node --check dist/site/sw.js` | PASS |
| `npm pack --dry-run --json` | PASS — 12 files, 49,185 B packed / 211,451 B unpacked |
| `npm audit` | PASS — 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |

The build used Vite 6.4.3, tsup 8.5.0, TypeScript 5.8.3, and ES2022 output.

## Independent packed-consumer and CLI coverage

The real tarball was installed with no lockfile into a new temporary consumer.
The npm bin was a working symlink; `--help` and `--version` exited `0`. ESM and
CommonJS loaded successfully, strict TypeScript compiled against the shipped
declarations, and `defineConfig`, `runCheck`, `compareTranscripts`, and
`renderReport` were exercised at runtime.

A representative signup flow submitted empty input, recovered with a valid
email, and submitted successfully. Its focus order was:

```text
Create account — button
Email address — textbox — required — invalid
Create account — button
Confirmation — heading
```

It also captured `assertive: Email is required` and
`polite: Account created for [redacted]`. The filled value
`qa-secret@example.test` appeared in neither JSON stdout, expected transcript,
nor HTML report. A repeat matched with exit `0`.

Additional fresh cases:

- A deliberately changed first event exited `1`, reported
  `firstDifference: 0`, marked the HTML report, and recovered through `--update`
  followed by a matching run.
- A zero-event flow using `wait: 0` produced an empty transcript and actionable
  report, then exited `0`.
- Unknown action, negative wait, numeric fill value, ambiguous target, blocked
  remote target, missing browser target, missing config, unknown flag, and
  missing `--report` value all exited `2` with actionable errors.
- A link to a controlled second origin was blocked before transmission: the CLI
  exited `2` and the second server received exactly 0 requests.
- The native input-button boundary produced the P1 false green above.

## Live identity and response policy

The previous deployment-only failure is resolved. The live site matches the
fresh candidate build byte-for-byte:

| Artifact | Candidate and live SHA-256 |
| --- | --- |
| `/` | `86bd87edcdea5466b903073c71958ac9d5db80c7d8184f7309754aa10364e9e2` |
| `/sw.js` | `35618b3f9ecdea2a839b416f64c7e306484273062094608ced7f3c15de9ef665` |
| `/assets/main-BsSEWpA2.js` | `ad647f68a6686d970b17c04e976d8adfed0ec461bc2e2a64ffa0ab41f560837c` |
| `/assets/styles-DFCNwszS.css` | `9aa74ae1cb86163fc001741b89a247d9d7855dec349cadbc33f86e5d696096b6` |
| `/announce-field.webp` | `a79caa314513a05437770c3a2a203ec64138a84e3a017cc354e9bf46dbe7572b` |
| `/privacy/` | `d74338af583cf79d0c9a945460919425b91f0009ac0a5594d37895f4d5d4667a` |
| `/terms/` | `643696c8bd810544418576f310fe7f744ac1752c9599bd7a09900171b1c487dd` |
| 404 body | `bbf3bf9c5b8e7915fecc554052d0e57e7e194e3025aa4f6cbb3a992585f4eec9` |

HTTP redirects to HTTPS. HTML is `public, must-revalidate, max-age=30`, hashed
JS/CSS is `public, max-age=31536000, immutable`, the hero is cached for one day,
and `sw.js` is `no-cache`.

Home, legal, asset, and 404 responses carry HSTS, strict-origin referrer policy,
`nosniff`, and a CSP restricted to same-origin images/styles/scripts/connect,
with objects blocked and framing denied. The not-found route now returns the
candidate 404 body with HTTP 404 and all policies.

## Browser, accessibility, privacy, and PWA evidence

Fresh Chromium checks covered `/`, `/privacy/`, `/terms/`, and the 404 page at
1280 × 800 and 390 × 844:

- Correct title and `lang=en`; one h1 and one main; ordered headings; complete
  image alt text; 16 px body text; no horizontal overflow.
- 0 serious/critical Axe findings at all eight page/viewport combinations.
- Home, privacy, and terms had 0 console errors, page errors, or failed requests.
  The intentional 404 navigation produced only Chromium's expected 404 resource
  console message.
- Keyboard traversal reached the skip link, brand/navigation, copy control,
  scrollable code, all four demo states, package link, and footer links without
  a trap. Focus used a visible 3 px `#2446d8` outline with 3 px offset. Space and
  Enter selected Divergence and No events; copy failure gave the recovery text
  “Select the command and copy it manually.”
- Reduced motion computed `scroll-behavior: auto` and 0.01 ms animation and
  transition durations. Desktop and mobile screenshots were visually coherent
  and the 390 px layout deliberately stacked content.
- Initial runtime requests were same-origin only. There were no cookies,
  local/session storage entries, IndexedDB databases, analytics, CDN fonts, or
  third-party runtime scripts. Cache Storage contained only the documented PWA
  shell cache.
- `/opt/fleet/lib/verify-url.sh` passed with a 752 ms load, title/lang/main/alt
  checks, one h1, no unlabeled buttons, and no console errors.

For the PWA, a live 390 px session installed and controlled the page with
`announce-check-docs-26a8432dc9b6`. After clearing Chromium's HTTP cache and
going offline, reload returned 200, stayed styled and interactive, showed the
offline banner, retained the sample report, and logged no errors. A separate
controlled update against the exact production output installed a changed
worker/cache, removed the prior cache after activation, and reloaded the fresh
document rather than a planted stale sentinel.

## Performance and budgets

Production output remains below every supplied asset budget:

- JS: 3,111 B raw / 1.48 kB gzip (200 kB budget)
- CSS: 10,681 B raw / 3.30 kB gzip (50 kB budget)
- Hero WebP: 37,324 B (300 kB budget)
- Fonts: 0 B; system stacks only

Lighthouse 12.8.2 mobile against the live URL:

| Category/metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| FCP | 1,116 ms |
| LCP | 1,151 ms |
| TBT | 25 ms |
| CLS | 0 |
| Speed Index | 1,267 ms |
| Total transfer | 46,402 B |

## External release dependency

`npm view screen-reader-smoke-test version --json` returns registry `E404`; the
documented install command is not usable until the factory publishes. The
verifier did not publish because registry credentials and release authority
belong to the factory. This does not explain the P1 code failure and must not be
used to waive it.

## Required next steps

1. Fix native accessible-name capture and add the selector-driven regression
   described under P1; independently reverify before publishing.
2. Give the privacy-page repository link a 44 px target at desktop and mobile.
3. After a passing candidate, publish the factory-owned npm release and verify
   the documented install command from the registry.
