import { createServer } from "node:http";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runCheck } from "../src/runner.js";

const fixture = `<!doctype html><html lang="en"><head><title>Signup fixture</title></head><body>
<main><h1>Create an account</h1><form><label for="email">Email address</label><input id="email" type="email" required><button>Create account</button></form><p role="status"></p></main>
<script>document.querySelector('form').addEventListener('submit',event=>{event.preventDefault();document.querySelector('[role=status]').textContent='Account created for '+document.querySelector('input').value})</script>
</body></html>`;

let server: ReturnType<typeof createServer>;
let origin: string;

beforeAll(async () => {
  server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(fixture);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Fixture server did not bind.");
  origin = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

describe("documented signup flow", () => {
  it("records, redacts, reports, and then matches a checked-in contract", async () => {
    const directory = await mkdtemp(join(process.cwd(), ".announce-test-run-"));
    const configPath = join(directory, "announce-check.config.mjs");
    const expectedPath = join(directory, "announce-check.expected.json");
    const reportDirectory = join(directory, "report");
    await writeFile(configPath, `export default {
      name: "Signup confirmation",
      url: "${origin}",
      expectedPath: "./announce-check.expected.json",
      steps: [
        { action: "fill", target: { label: "Email address" }, value: "pilot@example.test" },
        { action: "click", target: { role: "button", name: "Create account" } },
        { action: "wait", for: 60 }
      ]
    };`);

    const recorded = await runCheck({ configPath, update: true, reportDirectory });
    expect(recorded.matches).toBe(true);
    expect(recorded.received.map((event) => event.text)).toEqual([
      "Email address — textbox — required",
      "Create account — button",
      "Account created for [redacted]"
    ]);
    const serialized = await readFile(expectedPath, "utf8");
    expect(serialized).not.toContain("pilot@example.test");
    expect(await readFile(join(reportDirectory, "index.html"), "utf8")).toContain("Contract matched");

    const verified = await runCheck({ configPath, writeReport: false });
    expect(verified.matches).toBe(true);
  }, 30_000);
});
