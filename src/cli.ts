import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { eventToLine } from "./compare.js";
import { runCheck } from "./runner.js";

interface CliOptions {
  configPath?: string;
  update: boolean;
  json: boolean;
  reportDirectory?: string;
  writeReport: boolean;
  help: boolean;
  version: boolean;
}

const HELP = `Announce Check 0.1.0

Verify focus semantics and ARIA live-region changes for one browser flow.

Usage:
  announce-check [config] [options]

Options:
  --update             Record and overwrite the expected transcript
  --json               Print a machine-readable result to stdout
  --report <directory> Write the local HTML report to this directory
  --no-report          Do not write an HTML report
  --help, -h           Show this help
  --version, -v        Print the version

Exit codes:
  0  Transcript matched, or was updated
  1  First transcript divergence found
  2  Configuration, target, or browser error

Remote targets are blocked unless the config sets allowRemote: true.
Filled values are never written to transcripts, JSON output, or reports.`;

export function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = { update: false, json: false, writeReport: true, help: false, version: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]!;
    if (arg === "--update") options.update = true;
    else if (arg === "--json") options.json = true;
    else if (arg === "--no-report") options.writeReport = false;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--version" || arg === "-v") options.version = true;
    else if (arg === "--report") {
      const value = args[++index];
      if (!value) throw new Error("--report requires a directory.");
      options.reportDirectory = value;
    } else if (arg.startsWith("-")) throw new Error(`Unknown option: ${arg}`);
    else if (options.configPath) throw new Error(`Unexpected argument: ${arg}`);
    else options.configPath = arg;
  }
  return options;
}

export async function main(args = process.argv.slice(2)): Promise<number> {
  let options: CliOptions;
  try {
    options = parseArgs(args);
  } catch (error) {
    console.error(`Announce Check: ${error instanceof Error ? error.message : String(error)}\nRun announce-check --help for usage.`);
    return 2;
  }
  if (options.help) {
    console.log(HELP);
    return 0;
  }
  if (options.version) {
    console.log("0.1.0");
    return 0;
  }

  try {
    const result = await runCheck(options);
    if (options.json) console.log(JSON.stringify(result));
    else {
      const output = options.json ? console.error : console.log;
      if (result.updated) output(`Recorded ${result.received.length} events for “${result.name}”.`);
      else if (result.matches) output(`✓ ${result.name}: ${result.received.length} events matched.`);
      else {
        const index = result.diff.firstDifference ?? 0;
        output(`× ${result.name}: first difference at event ${index + 1}.`);
        output(`  expected: ${result.diff.expected ? eventToLine(result.diff.expected) : "<no event>"}`);
        output(`  received: ${result.diff.received ? eventToLine(result.diff.received) : "<no event>"}`);
      }
      if (result.reportPath) output(`  report: ${result.reportPath}`);
      output(`  scope: ${result.notice}`);
    }
    return result.updated || result.matches ? 0 : 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (options.json) console.log(JSON.stringify({ ok: false, error: message }));
    else console.error(`Announce Check: ${message}`);
    return 2;
  }
}

// npm exposes package binaries through node_modules/.bin symlinks. Resolve the
// invoked filename before comparing it to this module so both direct execution
// and the installed bin call main().
if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  process.exitCode = await main();
}
