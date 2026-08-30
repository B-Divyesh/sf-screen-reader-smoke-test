/**
 * Static pages still need a reliable navigation cue. Moving focus to the page
 * heading gives keyboard and screen-reader users the same clear destination
 * that a client-side router would provide. preventScroll preserves the
 * browser's restored position when the visitor uses Back or Forward.
 */
function announceRoute() {
  const heading = document.querySelector<HTMLElement>("main h1");
  const announcement = document.querySelector<HTMLElement>("#route-announcement");
  if (!heading) return;

  heading.focus({ preventScroll: true });
  if (announcement) announcement.textContent = heading.textContent?.trim() ?? "";
}

window.addEventListener("pageshow", announceRoute);
