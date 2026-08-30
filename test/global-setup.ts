import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    siteOrigin: string;
    siteServerPid: number;
  }
}

const HOST = "127.0.0.1";
const READINESS_TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 100;
const SHUTDOWN_TIMEOUT_MS = 10_000;

let viteProcess: ChildProcess | undefined;

async function reservePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const reservation = createServer();
    reservation.once("error", reject);
    reservation.listen(0, HOST, () => {
      const address = reservation.address();
      if (!address || typeof address === "string") {
        reservation.close();
        reject(new Error("Could not reserve a loopback port for Vite."));
        return;
      }
      reservation.close((error) => error ? reject(error) : resolve(address.port));
    });
  });
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitUntilReady(origin: string, child: ChildProcess, output: string[]): Promise<void> {
  const deadline = Date.now() + READINESS_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Shared Vite server exited before it was ready (${child.exitCode}).\n${output.join("")}`);
    }
    try {
      const response = await fetch(`${origin}/`, { signal: AbortSignal.timeout(2_000) });
      const html = await response.text();
      if (response.ok && html.includes("Catch changed keyboard focus and status messages.")) return;
    } catch {
      // Vite may still be starting. Retry until the explicit readiness budget expires.
    }
    await delay(POLL_INTERVAL_MS);
  }
  throw new Error(`Shared Vite server did not become ready within ${READINESS_TIMEOUT_MS} ms.\n${output.join("")}`);
}

async function stopProcessGroup(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null || !child.pid) return;
  const exited = new Promise<void>((resolve) => child.once("exit", () => resolve()));
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
  const stopped = await Promise.race([
    exited.then(() => true),
    delay(SHUTDOWN_TIMEOUT_MS).then(() => false)
  ]);
  if (!stopped && child.exitCode === null) {
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {
      child.kill("SIGKILL");
    }
    await exited;
  }
}

export async function setup(project: TestProject): Promise<void> {
  const port = await reservePort();
  const origin = `http://${HOST}:${port}`;
  const output: string[] = [];
  viteProcess = spawn(
    "npm",
    ["run", "dev:site", "--", "--host", HOST, "--port", String(port), "--strictPort"],
    { cwd: process.cwd(), detached: true, stdio: ["ignore", "pipe", "pipe"] }
  );
  const recordOutput = (chunk: Buffer) => {
    output.push(chunk.toString());
    if (output.length > 100) output.shift();
  };
  viteProcess.stdout?.on("data", recordOutput);
  viteProcess.stderr?.on("data", recordOutput);

  try {
    await waitUntilReady(origin, viteProcess, output);
  } catch (error) {
    await stopProcessGroup(viteProcess);
    viteProcess = undefined;
    throw error;
  }

  if (!viteProcess.pid) throw new Error("Shared Vite server started without a process id.");
  project.provide("siteOrigin", origin);
  project.provide("siteServerPid", viteProcess.pid);
}

export async function teardown(): Promise<void> {
  if (!viteProcess) return;
  await stopProcessGroup(viteProcess);
  viteProcess = undefined;
}
