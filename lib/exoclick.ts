/**
 * ExoClick Ad Serving Helper & Debouncer
 * Ensures single clean DOM scan per route transition to maximize RTB fill rate and bid pricing.
 */

let serveTimeout: ReturnType<typeof setTimeout> | null = null;

export function triggerExoclickServe() {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/admin")) return;

  if (serveTimeout) {
    clearTimeout(serveTimeout);
  }

  // Debounce to allow React hydration and all <ins> tags to mount cleanly
  serveTimeout = setTimeout(() => {
    try {
      window.AdProvider = window.AdProvider || [];
      window.AdProvider.push({ serve: {} });
    } catch (e) {
      console.error("ExoClick serve error:", e);
    }
  }, 120);
}
