import { chromium, type Locator, type Page } from "playwright";
import type { AnnounceCheckConfig, FlowStep, Target, TranscriptEvent } from "./types.js";

type BrowserEvent =
  | { kind: "focus"; text: string; states: string[] }
  | { kind: "live"; text: string; politeness: "polite" | "assertive" };

export async function executeFlow(config: AnnounceCheckConfig): Promise<TranscriptEvent[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    reducedMotion: "reduce",
    locale: "en-US",
    colorScheme: "light"
  });
  const page = await context.newPage();
  const events: TranscriptEvent[] = [];
  const sensitiveValues = config.steps
    .filter((step): step is Extract<FlowStep, { action: "fill" }> => step.action === "fill")
    .map((step) => step.value)
    .filter(Boolean);
  let currentStep = 0;
  let bindingQueue = Promise.resolve();
  let blockedNavigation: URL | undefined;

  try {
    await page.exposeBinding("__announceCheckPush", ({ frame }, incoming: BrowserEvent) => {
      if (frame !== page.mainFrame()) return;
      const eventStep = currentStep;
      bindingQueue = bindingQueue.then(() => {
        events.push({
          kind: incoming.kind,
          // The page observer captured this text at focusin time. Never ask
          // Playwright for :focus later: synchronous validation handlers can
          // move focus before an exposed binding is serviced.
          text: redact(incoming.text, sensitiveValues),
          ...(incoming.kind === "live" ? { politeness: incoming.politeness } : {}),
          step: eventStep
        });
      });
      return bindingQueue;
    });
    await page.route("**/*", async (route) => {
      const request = route.request();
      const candidate = new URL(request.url());
      if (request.isNavigationRequest() && request.frame() === page.mainFrame() && !isAllowed(candidate, config)) {
        blockedNavigation = candidate;
        await route.abort("blockedbyclient");
        return;
      }
      await route.continue();
    });
    await page.addInitScript(installObserver);
    page.setDefaultTimeout(config.timeout ?? 10_000);
    await page.goto(config.url, { waitUntil: "domcontentloaded" });
    assertCurrentUrl(page, config);

    for (let index = 0; index < config.steps.length; index += 1) {
      currentStep = index + 1;
      await performStep(page, config.steps[index]!, config);
      await page.waitForTimeout(config.settleTime ?? 80);
      assertCurrentUrl(page, config);
    }
    await bindingQueue;
    return events;
  } catch (error) {
    if (blockedNavigation) throw new Error(redact(originError(blockedNavigation, config), sensitiveValues));
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(redact(message, sensitiveValues));
  } finally {
    await browser.close();
  }
}

async function performStep(page: Page, step: FlowStep, config: AnnounceCheckConfig): Promise<void> {
  switch (step.action) {
    case "fill":
      await locate(page, step.target).fill(step.value);
      return;
    case "click":
      await locate(page, step.target).click();
      return;
    case "press":
      if (step.target) await locate(page, step.target).press(step.key);
      else await page.keyboard.press(step.key);
      return;
    case "goto": {
      const destination = new URL(step.url, config.url);
      assertAllowed(destination, config);
      await page.goto(destination.href, { waitUntil: "domcontentloaded" });
      return;
    }
    case "wait":
      if (typeof step.for === "number") await page.waitForTimeout(step.for);
      else if ("selector" in step.for) await page.locator(step.for.selector).waitFor({ state: "visible" });
      else await page.getByText(step.for.text, { exact: true }).waitFor({ state: "visible" });
  }
}

function locate(page: Page, target: Target): Locator {
  if ("selector" in target) return page.locator(target.selector);
  if ("label" in target) return page.getByLabel(target.label, { exact: target.exact ?? true });
  return page.getByRole(target.role as Parameters<Page["getByRole"]>[0], {
    name: target.name,
    exact: target.exact ?? true
  });
}

function assertCurrentUrl(page: Page, config: AnnounceCheckConfig): void {
  assertAllowed(new URL(page.url()), config);
}

function assertAllowed(candidate: URL, config: AnnounceCheckConfig): void {
  if (!isAllowed(candidate, config)) throw new Error(originError(candidate, config));
}

function isAllowed(candidate: URL, config: AnnounceCheckConfig): boolean {
  return candidate.origin === new URL(config.url).origin;
}

function originError(candidate: URL, config: AnnounceCheckConfig): string {
  const approved = new URL(config.url);
  return `Flow left its authorized origin (${approved.origin}) and reached ${candidate.origin}. Add a separate check for that origin.`;
}

function redact(text: string, values: string[]): string {
  return values.reduce((safe, value) => safe.split(value).join("[redacted]"), text);
}

function installObserver(): void {
  type Push = (event: BrowserEvent) => Promise<void>;
  const browserWindow = window as typeof window & { __announceCheckPush: Push };
  const clean = (value: string | null | undefined) => (value ?? "").replace(/\s+/g, " ").trim();

  const nameOf = (element: Element): string => {
    const labelledBy = clean(element.getAttribute("aria-labelledby"));
    if (labelledBy) {
      const joined = labelledBy
        .split(" ")
        .map((id) => clean(document.getElementById(id)?.textContent))
        .filter(Boolean)
        .join(" ");
      if (joined) return joined;
    }
    const ariaLabel = clean(element.getAttribute("aria-label"));
    if (ariaLabel) return ariaLabel;
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
      const labelText = Array.from(element.labels ?? [])
        .map((label) => clean(label.textContent))
        .filter(Boolean)
        .join(" ");
      if (labelText) return labelText;
    }
    if (element instanceof HTMLInputElement) {
      const type = element.type.toLowerCase();
      if (["button", "submit", "reset"].includes(type)) return clean(element.value);
    }
    if (element instanceof HTMLImageElement) return clean(element.alt);
    const title = clean(element.getAttribute("title"));
    if (title) return title;
    if (element.matches("button, a, summary, h1, h2, h3, h4, h5, h6, [role='button'], [role='link'], [role='tab'], [role='option'], [role='heading']")) {
      return clean(element.textContent);
    }
    return "";
  };

  const roleOf = (element: Element): string => {
    const explicit = clean(element.getAttribute("role"));
    if (explicit) return explicit;
    const tag = element.tagName.toLowerCase();
    if (tag === "button" || tag === "summary") return "button";
    if (tag === "a" && element.hasAttribute("href")) return "link";
    if (/^h[1-6]$/.test(tag)) return "heading";
    if (tag === "textarea") return "textbox";
    if (tag === "select") return element.hasAttribute("multiple") ? "listbox" : "combobox";
    if (element instanceof HTMLInputElement) {
      const type = element.type.toLowerCase();
      if (["button", "submit", "reset"].includes(type)) return "button";
      if (type === "checkbox") return "checkbox";
      if (type === "radio") return "radio";
      if (type === "range") return "slider";
      if (type === "search") return "searchbox";
      return "textbox";
    }
    return tag;
  };

  const focusEvent = (element: Element): Extract<BrowserEvent, { kind: "focus" }> => {
    const states: string[] = [];
    if (element.matches(":required")) states.push("required");
    if (element.matches(":disabled") || element.getAttribute("aria-disabled") === "true") states.push("disabled");
    if (element.getAttribute("aria-invalid") === "true") states.push("invalid");
    const expanded = element.getAttribute("aria-expanded");
    if (expanded === "true") states.push("expanded");
    if (expanded === "false") states.push("collapsed");
    const checked = element.getAttribute("aria-checked");
    if (checked === "true") states.push("checked");
    if (checked === "false") states.push("not checked");
    return { kind: "focus", text: [nameOf(element), roleOf(element), ...states].filter(Boolean).join(" — "), states };
  };

  document.addEventListener(
    "focusin",
    (event) => {
      if (!(event.target instanceof Element)) return;
      const observed = focusEvent(event.target);
      if (observed.text) void browserWindow.__announceCheckPush(observed);
    },
    true
  );

  const pending = new WeakMap<Element, number>();
  const scheduleLive = (region: Element) => {
    const oldTimer = pending.get(region);
    if (oldTimer) window.clearTimeout(oldTimer);
    const timer = window.setTimeout(() => {
      pending.delete(region);
      const text = clean(region.textContent);
      if (!text) return;
      const live = region.getAttribute("aria-live");
      const role = region.getAttribute("role");
      const politeness: "polite" | "assertive" =
        live === "assertive" || role === "alert" ? "assertive" : "polite";
      void browserWindow.__announceCheckPush({ kind: "live", text, politeness });
    }, 20);
    pending.set(region, timer);
  };

  const findRegions = (node: Node): Element[] => {
    const selector = "[aria-live]:not([aria-live='off']), [role='status'], [role='alert'], [role='log']";
    const base = node instanceof Element ? node : node.parentElement;
    if (!base) return [];
    const regions = new Set<Element>();
    const closest = base.closest(selector);
    if (closest) regions.add(closest);
    if (base.matches(selector)) regions.add(base);
    base.querySelectorAll(selector).forEach((region) => regions.add(region));
    return [...regions];
  };

  const begin = () => {
    if (!document.documentElement) return;
    new MutationObserver((mutations) => {
      const regions = new Set<Element>();
      mutations.forEach((mutation) => {
        findRegions(mutation.target).forEach((region) => regions.add(region));
        mutation.addedNodes.forEach((node) => findRegions(node).forEach((region) => regions.add(region)));
      });
      regions.forEach(scheduleLive);
    }).observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["aria-live", "role", "aria-label", "aria-labelledby", "aria-invalid", "aria-expanded", "aria-checked", "disabled", "required"]
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", begin, { once: true });
  else begin();
}
