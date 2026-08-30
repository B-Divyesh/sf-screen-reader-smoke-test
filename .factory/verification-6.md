# Independent verification 6 — PASS

- Date: 2026-08-30 UTC
- Work order: `screen-reader-smoke-test-verify-6`
- Candidate commit: `88b2a06271d5b9f2c9f8b0c5a151be562139f938`
- Live URL: <https://screen-reader-smoke-test.sociobot.in/>
- Artifact: npm library/CLI plus static documentation PWA and sample playground

## Release decision

**PASS.** The requested commit is cleanly buildable and the deployed site is
byte-for-byte the candidate production build. The prior deployment-only concern
does not reproduce. The real job works: a team can install the versioned
tarball, record/check a local browser-flow announcement contract, receive the
first difference, and use the one-click sample playground without sending data
to a third party.

No release-blocking defects were found.

## Required first checks

### Claims from the demo entry point

The clean checkout contained `.factory/claims.json`. After `npm ci`, I ran each
manifest command individually. All ten passed:

| Claim | Result |
| --- | --- |
| `demo-first-difference` | PASS — `/demo/` at desktop and 390 px edits, matches, resets, reports a format error, and has no serious/critical Axe issue. |
| `local-private-flow` | PASS — loopback signup capture redacts the filled value, writes a local report, and rechecks. |
| `site-no-tracking` | PASS — complete demo flow stays same-origin with no cookies, local/session storage, or IndexedDB. |
| `offline-demo` | PASS — a fresh context clears HTTP cache, reloads `/demo/` offline from the worker, and compares. |
| `download-package` | PASS — built tarball installs and runs in an empty consumer. |
| `cli-exit-codes` | PASS — update/match `0`, changed transcript `1`, invalid option `2`. |
| `origin-boundary` | PASS — remote targets require `allowRemote`; loopback works by default. |
| `workflow-steps` | PASS — fill, click, key press, navigation, and page-state waits execute. |
| `package-formats` | PASS — ESM, CommonJS, declarations, documented functions, and bin are present. |
| `mit-license` | PASS — metadata and shipped MIT grant agree. |

Every manifest id has exactly one `@claim:<id>` occurrence in the tests.

### Cold first read

A fresh live visit says **“Catch changed focus and live announcements.”** It
immediately says it is for “small web teams checking one critical form flow
before release,” and the first primary action is **“Try it with sample data”**
with the result “Loads a signup transcript and shows its first change.” The
first-screen plain-words and one-click demo requirements pass.

## Local and package gates

| Check | Result / evidence |
| --- | --- |
| `npm ci` | PASS — 95 packages installed; audit reported 0 vulnerabilities. |
| `npm test` | PASS — 7 files, 19 tests in 51.32 s. |
| `npm run lint` and `npm run typecheck` | PASS — both run `tsc --noEmit`. |
| `npm run build` | PASS — builds `dist/library`, `dist/site`, tarball download, and versioned service worker. |
| `npm pack --dry-run --json --ignore-scripts` | PASS — 12 files, 51,965 B package / 222,945 B unpacked. |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities. |
| `git diff --check` | PASS before reporting changes. |

I separately installed the exact HTTPS download URL into a new temporary Node
consumer. `announce-check --version` returned `0.1.0`, `--help` documented
the expected behavior and 0/1/2 exit codes, and `compareTranscripts([], [])`
returned a match through both the ESM and CommonJS entry points. The packed
consumer claim test exercised the normal record/update/recheck, changed-name
mismatch, invalid input, redaction, and public declarations against the same
tarball bytes.

## Live browser, accessibility, privacy, and offline checks

Playwright checked `/`, `/demo/`, `/privacy/`, and `/terms/` at 1280×800 and
390×844 with reduced motion. Each response was 200 with an appropriate title,
`lang=en`, exactly one `h1`, one `main`, no horizontal overflow, zero
serious/critical Axe findings, and no console/page/request errors. The live
missing route responds HTTP 404 with the styled not-found page and the same
security policies.

Keyboard-only testing found the skip link first and visible at both widths
(`3px solid #2446d8`, 3 px offset); Enter moves to `#main`. In the demo,
Enter compares a corrected transcript, Space resets it, and invalid text
returns “Transcript format needs attention” with the actionable line-prefix
instruction. All visible product actions are at least 44 px in both test
viewports.

In a fresh 390 px context, the live service worker controlled `/demo/` after a
reload. After clearing the ordinary browser cache and going offline, reload
returned 200, the offline banner appeared, and the sample changed to
“Contract matched,” with no errors. The worker cache was
`announce-check-docs-f55b36e0d25d`.

The complete live demo request log was same-origin only. It had no cookies,
localStorage, sessionStorage, or IndexedDB data; the sole cache is the public
service-worker shell. No sign-in or server-side product/API endpoint exists,
so Entra and rate-limit/429 checks are not applicable.

`/opt/fleet/lib/verify-url.sh` also passed against the live home: 860 ms load,
title/lang/main present, one h1, no missing image alts or unlabeled buttons,
and zero console errors.

## Deployment identity, response policy, and budgets

Fresh local production output exactly matched the live deployment:

| Artifact | SHA-256 |
| --- | --- |
| `/` | `a3799608288506144d0b5acc17a676d79aa8247ccabba591e6169fae76b07abb` |
| `/demo/` | `5848e0179571f72f70a1cfc6349ab0249a6e6f17b1358c5be907eee7d75dd63d` |
| `/privacy/` | `1465686e62a22d360576453602c22dd28b20f046244ddf36484cf0b893fc06a0` |
| `/terms/` | `08e9e04db26c246683ff4805bdb8ded6c79d423d60690550985f8c2289f3c3f5` |
| `/sw.js` | `2a56125a988610f2d6755b20d358be28f925b91211dc67a867720f55179c0ced` |
| package download | `1069b04970931c631e4dedd37b74ade8476158cd7eed65249a9c60ae7bd89d3a` |

Live CSP is self-only for default/image/style/script/connect sources, blocks
objects and framing, and is accompanied by HSTS, `nosniff`, and strict-origin
referrer policy. HTML uses 30-second must-revalidate caching; hashed JS/CSS
are immutable for one year; `sw.js` is `no-cache`; the tarball and hero use a
one-day public cache. HTTP redirects to HTTPS.

Initial JavaScript is 3,115 B raw (1,613 B gzip across the initial two files),
CSS is 13,167 B raw / 3,752 B gzip, the hero WebP is 37,324 B, and no webfonts
ship. These are within the stated static-product budgets.

## Known non-blocker

The npm registry name is intentionally not yet published. The product does not
claim it is: the landing page and README clearly provide the tested versioned
HTTPS tarball, which was independently installed above. Registry publication
remains a factory release step after acceptance.
