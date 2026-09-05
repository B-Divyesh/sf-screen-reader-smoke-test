/**
 * A direct visit must leave the skip link first in the keyboard path. Once a
 * visitor moves between site documents, the destination heading becomes the
 * reliable navigation cue. Back/Forward can restore from bfcache or reload a
 * document, so both navigation paths are handled here.
 */
const heading = document.querySelector<HTMLElement>("main h1");
const announcement = document.querySelector<HTMLElement>("#route-announcement");

function cameFromThisSite(): boolean {
  if (!document.referrer) return false;
  try {
    return new URL(document.referrer).origin === window.location.origin;
  } catch {
    return false;
  }
}

function navigationType(): PerformanceNavigationTiming["type"] | undefined {
  return performance.getEntriesByType("navigation")[0] instanceof PerformanceNavigationTiming
    ? (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).type
    : undefined;
}

function announceRoute(): void {
  if (!heading || !announcement) return;
  heading.focus({ preventScroll: true });
  announcement.textContent = "";
  requestAnimationFrame(() => {
    announcement.textContent = heading.textContent?.trim() ?? "";
  });
}

window.addEventListener("pageshow", (event) => {
  const routedWithinSite = cameFromThisSite() && navigationType() === "navigate";
  const restoredByHistory = event.persisted || navigationType() === "back_forward";
  if (routedWithinSite || restoredByHistory) announceRoute();
});
