import { mkdtemp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";
import { parseArgs } from "../src/cli.js";

describe("configuration safety", () => {
  it("blocks remote targets without an explicit authorization", async () => {
    const directory = await mkdtemp(join(process.cwd(), ".announce-test-config-"));
    const path = join(directory, "remote.mjs");
    await writeFile(path, 'export default { name: "Remote", url: "https://example.com", steps: [{ action: "wait", for: 1 }] };');
    await expect(loadConfig(path)).rejects.toThrow("allowRemote: true");
  });

  it("parses non-interactive CLI options", () => {
    expect(parseArgs(["flow.mjs", "--json", "--no-report", "--update"])).toMatchObject({
      configPath: "flow.mjs",
      json: true,
      writeReport: false,
      update: true
    });
    expect(() => parseArgs(["--report"])).toThrow("requires a directory");
  });
});
