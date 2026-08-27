export type Target =
  | { role: string; name?: string; exact?: boolean }
  | { label: string; exact?: boolean }
  | { selector: string };

export type FlowStep =
  | { action: "fill"; target: Target; value: string; label?: string }
  | { action: "click"; target: Target; label?: string }
  | { action: "press"; key: string; target?: Target; label?: string }
  | { action: "goto"; url: string; label?: string }
  | { action: "wait"; for: number | { selector: string } | { text: string }; label?: string };

export interface AnnounceCheckConfig {
  name: string;
  url: string;
  steps: FlowStep[];
  expectedPath?: string;
  allowRemote?: boolean;
  timeout?: number;
  settleTime?: number;
}

export interface TranscriptEvent {
  kind: "focus" | "live";
  text: string;
  step: number;
  politeness?: "polite" | "assertive";
}

export interface TranscriptFile {
  version: 1;
  name: string;
  notice: string;
  events: TranscriptEvent[];
}

export interface TranscriptDiff {
  matches: boolean;
  firstDifference: number | null;
  expected?: TranscriptEvent;
  received?: TranscriptEvent;
}

export interface CheckResult {
  name: string;
  url: string;
  matches: boolean;
  updated: boolean;
  expected: TranscriptEvent[];
  received: TranscriptEvent[];
  diff: TranscriptDiff;
  reportPath?: string;
  durationMs: number;
  notice: string;
}

export interface RunCheckOptions {
  configPath?: string;
  update?: boolean;
  reportDirectory?: string;
  writeReport?: boolean;
}
