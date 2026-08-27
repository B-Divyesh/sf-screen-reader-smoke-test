import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { AnnounceCheckConfig, TranscriptFile } from "./types.js";

export const DEFAULT_CONFIG = "announce-check.config.mjs";
export const DEFAULT_EXPECTED = "announce-check.expected.json";
export const NOTICE =
  "Browser accessibility semantics are not equivalent to screen-reader speech or WCAG certification.";

export function defineConfig(config: AnnounceCheckConfig): AnnounceCheckConfig {
  return config;
}

export async function loadConfig(configPath = DEFAULT_CONFIG): Promise<{
  config: AnnounceCheckConfig;
  directory: string;
}> {
  const absolute = resolve(configPath);
  try {
    await access(absolute, constants.R_OK);
  } catch {
    throw new Error(`Config not found: ${absolute}`);
  }
  const imported = (await import(pathToFileURL(absolute).href)) as { default?: unknown };
  const config = imported.default;
  validateConfig(config);
  return { config, directory: resolve(absolute, "..") };
}

function validateConfig(value: unknown): asserts value is AnnounceCheckConfig {
  if (!value || typeof value !== "object") throw new Error("Config must export an object as default.");
  const config = value as Partial<AnnounceCheckConfig>;
  if (!config.name || typeof config.name !== "string") throw new Error("Config requires a name.");
  if (!config.url || typeof config.url !== "string") throw new Error("Config requires a URL.");
  if (!Array.isArray(config.steps) || config.steps.length === 0) {
    throw new Error("Config requires at least one flow step.");
  }
  let parsed: URL;
  try {
    parsed = new URL(config.url);
  } catch {
    throw new Error(`Config URL is invalid: ${config.url}`);
  }
  if (!isLoopback(parsed) && config.allowRemote !== true) {
    throw new Error(
      `Remote target ${parsed.origin} is blocked. Set allowRemote: true only when you are authorized to test it.`
    );
  }
}

export function isLoopback(url: URL): boolean {
  return ["localhost", "127.0.0.1", "[::1]", "::1"].includes(url.hostname);
}

export function resolveFrom(directory: string, candidate: string): string {
  return isAbsolute(candidate) ? candidate : resolve(directory, candidate);
}

export async function readTranscript(path: string): Promise<TranscriptFile> {
  let source: string;
  try {
    source = await readFile(path, "utf8");
  } catch {
    throw new Error(`Expected transcript not found: ${path}. Run announce-check --update to create it.`);
  }
  const parsed = JSON.parse(source) as Partial<TranscriptFile>;
  if (parsed.version !== 1 || !Array.isArray(parsed.events)) {
    throw new Error(`Expected transcript is not a supported Announce Check v1 file: ${path}`);
  }
  return parsed as TranscriptFile;
}
