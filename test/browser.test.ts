import { createServer } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { executeFlow } from "../src/browser.js";
import type { AnnounceCheckConfig } from "../src/types.js";

let primary: ReturnType<typeof createServer>;
let escaped: ReturnType<typeof createServer>;
let origin: string;
let escapedOrigin: string;
let escapedRequests = 0;

beforeAll(async () => {
  escaped = createServer((_request, response) => {
    escapedRequests += 1;
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end("<!doctype html><title>Escaped</title>");
  });
  await new Promise<void>((done) => escaped.listen(0, "127.0.0.1", done));
  const escapedAddress = escaped.address();
  if (!escapedAddress || typeof escapedAddress === "string") throw new Error("Escape fixture did not bind.");
  escapedOrigin = `http://127.0.0.1:${escapedAddress.port}`;

  primary = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(`<!doctype html><html lang="en"><head><title>Signup fixture</title></head><body>
      <main><h1>Create an account</h1><form novalidate>
        <label for="email">Email address</label><input id="email" type="email" required>
        <button>Create account</button><p role="alert"></p><p role="status"></p>
      </form><h2 id="confirmation" tabindex="-1">Confirmation</h2><a href="${escapedOrigin}/escaped">Leave this origin</a></main>
      <script>
        const form = document.querySelector('form'); const input = document.querySelector('input');
        form.addEventListener('submit', (event) => { event.preventDefault();
          if (!input.value) { input.setAttribute('aria-invalid', 'true'); document.querySelector('[role=alert]').textContent = 'Email is required'; input.focus(); return; }
          input.setAttribute('aria-invalid', 'false'); document.querySelector('[role=status]').textContent = 'Account created for ' + input.value; document.querySelector('#confirmation').focus();
        });
      </script></body></html>`);
  });
  await new Promise<void>((done) => primary.listen(0, "127.0.0.1", done));
  const address = primary.address();
  if (!address || typeof address === "string") throw new Error("Primary fixture did not bind.");
  origin = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await Promise.all([primary, escaped].map((server) => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))));
});

describe("browser flow capture boundaries", () => {
  it("@claim:workflow-steps runs every documented flow action against a loopback page", async () => {
    const config: AnnounceCheckConfig = {
      name: "Documented actions",
      url: origin,
      steps: [
        { action: "fill", target: { label: "Email address" }, value: "actions@example.test" },
        { action: "press", target: { label: "Email address" }, key: "Tab" },
        { action: "click", target: { role: "button", name: "Create account" } },
        { action: "goto", url: "/ready" },
        { action: "wait", for: { selector: "#confirmation" } },
        { action: "wait", for: { text: "Create an account" } },
        { action: "wait", for: 10 }
      ]
    };

    const events = await executeFlow(config);
    expect(events.some((event) => event.text === "Email address — textbox — required")).toBe(true);
    expect(events.some((event) => event.text === "Create account — button")).toBe(true);
    expect(events.map((event) => event.text).join("\n")).not.toContain("actions@example.test");
  }, 30_000);

  it("keeps each synchronous focusin event attached to the element that emitted it", async () => {
    const config: AnnounceCheckConfig = {
      name: "Synchronous form recovery",
      url: origin,
      steps: [
        { action: "click", target: { role: "button", name: "Create account" } },
        { action: "fill", target: { label: "Email address" }, value: "qa-secret@example.test" },
        { action: "click", target: { role: "button", name: "Create account" } },
        { action: "wait", for: 80 }
      ]
    };

    const events = await executeFlow(config);
    expect(events.filter((event) => event.kind === "focus").map((event) => event.text)).toEqual([
      "Create account — button",
      "Email address — textbox — required — invalid",
      "Create account — button",
      "Confirmation — heading"
    ]);
    expect(events.map((event) => event.text).join("\n")).not.toContain("qa-secret@example.test");
  }, 30_000);

  it("aborts an unauthorized main-frame navigation before the second origin receives it", async () => {
    escapedRequests = 0;
    const config: AnnounceCheckConfig = {
      name: "Origin boundary",
      url: origin,
      steps: [{ action: "click", target: { role: "link", name: "Leave this origin" } }]
    };
    await expect(executeFlow(config)).rejects.toThrow(`authorized origin (${origin}) and reached ${escapedOrigin}`);
    expect(escapedRequests).toBe(0);
  }, 30_000);
});
