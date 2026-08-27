import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { executeFlow } from "./browser.js";
import { compareTranscripts } from "./compare.js";
import { DEFAULT_EXPECTED, NOTICE, loadConfig, readTranscript, resolveFrom } from "./config.js";
import { renderReport } from "./report.js";
import type { CheckResult, RunCheckOptions, TranscriptFile } from "./types.js";

export async function runCheck(options: RunCheckOptions = {}): Promise<CheckResult> {
  const started = Date.now();
  const { config, directory } = await loadConfig(options.configPath);
  const expectedPath = resolveFrom(directory, config.expectedPath ?? DEFAULT_EXPECTED);
  const received = await executeFlow(config);
  let expected = received;
  let updated = false;

  if (options.update) {
    const transcript: TranscriptFile = {
      version: 1,
      name: config.name,
      notice: NOTICE,
      events: received
    };
    await mkdir(dirname(expectedPath), { recursive: true });
    await writeFile(expectedPath, `${JSON.stringify(transcript, null, 2)}\n`, "utf8");
    updated = true;
  } else {
    expected = (await readTranscript(expectedPath)).events;
  }

  const diff = compareTranscripts(expected, received);
  const result: CheckResult = {
    name: config.name,
    url: config.url,
    matches: diff.matches,
    updated,
    expected,
    received,
    diff,
    durationMs: Date.now() - started,
    notice: NOTICE
  };

  if (options.writeReport !== false) {
    const reportDirectory = resolve(options.reportDirectory ?? "announce-check-report");
    await mkdir(reportDirectory, { recursive: true });
    const reportPath = resolve(reportDirectory, "index.html");
    await writeFile(reportPath, renderReport(result), "utf8");
    result.reportPath = reportPath;
  }
  return result;
}
