# Announce Check

Announce Check is a small, reviewable announcement-contract test for one
business-critical web flow. It drives Chromium, records focus semantics and
ARIA live-region changes, compares them with a checked-in transcript, and writes
a private local HTML report that points to the first divergence.

It is for small web teams that want a focused release check without adopting a
hosted accessibility platform or a full screen-reader automation harness.

> Announce Check observes browser accessibility semantics and ARIA live-region
> changes. It does **not** emulate NVDA, VoiceOver, JAWS, or certify WCAG
> conformance. Keep a short manual screen-reader check in your release process.

## Install

```sh
npm install --save-dev screen-reader-smoke-test playwright@1.58.2
npx playwright install chromium
```

## Usage

Create `announce-check.config.mjs`:

```js
import { defineConfig } from "screen-reader-smoke-test";

export default defineConfig({
  name: "Signup confirmation",
  url: "http://127.0.0.1:4173/signup",
  expectedPath: "./announce-check.expected.json",
  steps: [
    { action: "fill", target: { label: "Email address" }, value: "pilot@example.test" },
    { action: "click", target: { role: "button", name: "Create account" } },
    { action: "wait", for: 250 }
  ]
});
```

Record the first local contract, review it, and check it in:

```sh
npx announce-check --update
git add announce-check.expected.json
```

Then verify it in CI:

```sh
npx announce-check
```

The command exits `0` on a match, `1` on a transcript mismatch, and `2` for a
configuration or browser failure. It writes `announce-check-report/index.html`
by default. `--json` writes one machine-readable result to stdout. Use
`--report <directory>` to move the report or
`--no-report` to skip it.

Only loopback URLs are accepted by default. For a remote staging URL you own or
are authorized to test, set `allowRemote: true` in the config. Announce Check
never includes filled values in events, console output, JSON, or reports.

### Supported steps

- `fill` — target by associated `label` or CSS selector
- `click` — target by accessible `role` and `name`, label, or CSS selector
- `press` — send a key such as `Enter`, `Tab`, or `ArrowDown`
- `goto` — navigate to an absolute authorized URL or a path relative to `url`
- `wait` — wait for milliseconds, a visible CSS selector, or visible text

### Programmatic API

```ts
import { runCheck } from "screen-reader-smoke-test";

const result = await runCheck({
  configPath: "./announce-check.config.mjs",
  writeReport: false
});

if (!result.matches) process.exitCode = 1;
```

The package ships ESM, CommonJS, and TypeScript declarations. Its public API is
`defineConfig`, `runCheck`, `compareTranscripts`, and `renderReport`.

## Develop and verify

```sh
npm ci
npm test
npm run build
npm pack --dry-run
```

`npm run build` produces the publishable library and the static documentation
site at `dist/site/`. Run the site locally with `npm run dev:site`.

The project has no telemetry, accounts, cookies, remote fixture storage, or
third-party runtime assets. Reports and transcripts stay on your machine.

## License

MIT © 2026 Sociobot (Param Factory)
