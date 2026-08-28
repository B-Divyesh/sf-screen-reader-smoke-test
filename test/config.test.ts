import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { loadConfig, validateConfig } from "../src/config.js";
import { main, parseArgs } from "../src/cli.js";

describe("configuration safety", () => {
  it("blocks remote targets without an explicit authorization", async () => {
    const directory = await mkdtemp(join(process.cwd(), ".announce-test-config-"));
    const path = join(directory, "remote.mjs");
    await writeFile(path, 'export default { name: "Remote", url: "https://example.com", steps: [{ action: "wait", for: 1 }] };');
    await expect(loadConfig(path)).rejects.toThrow("allowRemote: true");
    await rm(directory, { recursive: true });
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

  it("rejects unsupported actions and malformed payloads before Chromium starts", async () => {
    const directory = await mkdtemp(join(process.cwd(), ".announce-test-config-"));
    const path = join(directory, "unknown-step.config.mjs");
    try {
      await writeFile(path, 'export default { name: "Typo", url: "http://127.0.0.1:4173", steps: [{ action: "clik", target: { role: "button", name: "Create account" } }] };');
      await expect(loadConfig(path)).rejects.toThrow("unsupported action: clik");
      const output = vi.spyOn(console, "log").mockImplementation(() => undefined);
      try {
        expect(await main([path, "--update", "--json", "--no-report"])).toBe(2);
      } finally {
        output.mockRestore();
      }

      expect(() => validateConfig({ name: "Malformed", url: "http://127.0.0.1:4173", steps: [{ action: "fill", target: { label: "" }, value: 3 }] }))
        .toThrow("label target requires a non-empty label");
      expect(() => validateConfig({ name: "Malformed", url: "http://127.0.0.1:4173", steps: [{ action: "press", key: "" }] }))
        .toThrow("press action requires a non-empty key");
      expect(() => validateConfig({ name: "Malformed", url: "http://127.0.0.1:4173", steps: [{ action: "wait", for: { text: "", selector: ".ready" } }] }))
        .toThrow("exactly one non-empty selector or text");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
