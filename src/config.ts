import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { AnnounceCheckConfig, TranscriptFile } from "./types.js";

export const DEFAULT_CONFIG = "announce-check.config.mjs";
export const DEFAULT_EXPECTED = "announce-check.expected.json";
export const NOTICE =
  "Browser accessibility semantics are not equivalent to screen-reader speech or WCAG certification.";

export function defineConfig(config: AnnounceCheckConfig): AnnounceCheckConfig {
  validateConfig(config);
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
  return { config, directory: dirname(absolute) };
}

export function validateConfig(value: unknown): asserts value is AnnounceCheckConfig {
  if (!value || typeof value !== "object") throw new Error("Config must export an object as default.");
  const config = value as Record<string, unknown>;
  if (!isNonEmptyString(config.name)) throw new Error("Config requires a non-empty name.");
  if (!isNonEmptyString(config.url)) throw new Error("Config requires a non-empty URL.");
  if (!Array.isArray(config.steps) || config.steps.length === 0) {
    throw new Error("Config requires at least one flow step.");
  }
  let parsed: URL;
  try {
    parsed = new URL(config.url);
  } catch {
    throw new Error(`Config URL is invalid: ${config.url}`);
  }
  if (config.allowRemote !== undefined && typeof config.allowRemote !== "boolean") {
    throw new Error("Config allowRemote must be a boolean when provided.");
  }
  if (config.expectedPath !== undefined && !isNonEmptyString(config.expectedPath)) {
    throw new Error("Config expectedPath must be a non-empty string when provided.");
  }
  validateOptionalMilliseconds(config.timeout, "timeout");
  validateOptionalMilliseconds(config.settleTime, "settleTime");
  config.steps.forEach((step, index) => validateStep(step, index, parsed));

  if (!isLoopback(parsed) && config.allowRemote !== true) {
    throw new Error(
      `Remote target ${parsed.origin} is blocked. Set allowRemote: true only when you are authorized to test it.`
    );
  }
}

function validateStep(value: unknown, index: number, baseUrl: URL): void {
  const prefix = `Flow step ${index + 1}`;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${prefix} must be an object.`);
  const step = value as Record<string, unknown>;
  if (!isNonEmptyString(step.action)) throw new Error(`${prefix} requires an action.`);
  if (step.label !== undefined && !isNonEmptyString(step.label)) throw new Error(`${prefix} label must be a non-empty string when provided.`);

  switch (step.action) {
    case "fill":
      validateTarget(step.target, prefix);
      if (typeof step.value !== "string") throw new Error(`${prefix} fill action requires a string value.`);
      return;
    case "click":
      validateTarget(step.target, prefix);
      return;
    case "press":
      if (!isNonEmptyString(step.key)) throw new Error(`${prefix} press action requires a non-empty key.`);
      if (step.target !== undefined) validateTarget(step.target, prefix);
      return;
    case "goto":
      if (!isNonEmptyString(step.url)) throw new Error(`${prefix} goto action requires a non-empty URL.`);
      try {
        new URL(step.url, baseUrl);
      } catch {
        throw new Error(`${prefix} goto URL is invalid: ${step.url}`);
      }
      return;
    case "wait":
      validateWaitFor(step.for, prefix);
      return;
    default:
      throw new Error(`${prefix} has an unsupported action: ${step.action}.`);
  }
}

function validateTarget(value: unknown, prefix: string): void {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${prefix} requires a target object.`);
  const target = value as Record<string, unknown>;
  const kinds = ["role", "label", "selector"].filter((key) => target[key] !== undefined);
  if (kinds.length !== 1) throw new Error(`${prefix} target must use exactly one of role, label, or selector.`);
  if (target.exact !== undefined && typeof target.exact !== "boolean") {
    throw new Error(`${prefix} target exact must be a boolean when provided.`);
  }
  if ("role" in target) {
    if (!isNonEmptyString(target.role)) throw new Error(`${prefix} role target requires a non-empty role.`);
    if (target.name !== undefined && !isNonEmptyString(target.name)) throw new Error(`${prefix} role target name must be a non-empty string when provided.`);
    return;
  }
  if ("label" in target && !isNonEmptyString(target.label)) throw new Error(`${prefix} label target requires a non-empty label.`);
  if ("selector" in target && !isNonEmptyString(target.selector)) throw new Error(`${prefix} selector target requires a non-empty selector.`);
}

function validateWaitFor(value: unknown, prefix: string): void {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${prefix} wait action requires non-negative milliseconds, a selector, or text.`);
  }
  const waitFor = value as Record<string, unknown>;
  const kinds = ["selector", "text"].filter((key) => key in waitFor);
  if (kinds.length !== 1 || !isNonEmptyString(waitFor[kinds[0]!])) {
    throw new Error(`${prefix} wait action requires exactly one non-empty selector or text.`);
  }
}

function validateOptionalMilliseconds(value: unknown, name: string): void {
  if (value !== undefined && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) {
    throw new Error(`Config ${name} must be non-negative milliseconds when provided.`);
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
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
