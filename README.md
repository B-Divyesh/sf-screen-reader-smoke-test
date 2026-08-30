# Announce Check

Announce Check tests the announcement contract for one critical browser flow.
It drives Chromium and records focus semantics and ARIA live-region changes.
It compares them with a checked-in transcript and writes a local HTML report.

It is for small web teams checking a signup, search, or form flow before release.

> Announce Check observes browser accessibility semantics and ARIA live-region
> changes. It does **not** emulate NVDA, VoiceOver, JAWS, or certify WCAG
> conformance. Keep a short manual screen-reader check in your release process.

## Install

The npm registry entry is not published yet. Install the tested versioned
tarball from the documentation site:

```sh
npm install --save-dev https://screen-reader-smoke-test.sociobot.in/downloads/screen-reader-smoke-test-0.1.0.tgz playwright@1.58.2
npx playwright install chromium
```

The factory can publish the same tarball to npm after release approval.

## Try the sample

Open <https://screen-reader-smoke-test.sociobot.in/demo/>. It loads an approved
signup transcript and a changed received transcript in one click. Edit either
input to see the first changed event. Reset restores the bundled sample.

The guide and playground work offline after one online visit. The demo stores
no cookies or personal browser data and sends no third-party runtime requests.

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

The command exits `0` on a match or update. It exits `1` on a transcript
difference and `2` for invalid input or a browser failure. It writes
`announce-check-report/index.html` by default. `--json` writes one result to
stdout. Use `--report <directory>` to move the report. Use `--no-report` to
skip it.

Loopback URLs work by default. A remote staging URL requires `allowRemote: true`.
Only test a remote system you own or are authorized to test. Announce Check
redacts filled values from events, console output, JSON, and reports.

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
npm run lint
npm run build
npm pack --dry-run
```

`npm run build` produces the publishable library and the static site at
`dist/site/`. The versioned download is in `dist/site/downloads/`. Run the site
locally with `npm run dev:site`.

The project has no telemetry, accounts, cookies, remote fixture storage, or
third-party runtime assets. Reports and transcripts stay on your machine.

## License

MIT © 2026 Sociobot (Param Factory)
