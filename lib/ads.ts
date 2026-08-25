/**
 * Monetag Advertising Configuration and Helpers
 */

export const MONETAG_DIRECT_LINK = "https://omg10.com/4/11653141";

/**
 * Open the direct smartlink in a new tab for monetization
 */
export function openDirectLink() {
  if (typeof window !== "undefined") {
    window.open(MONETAG_DIRECT_LINK, "_blank", "noopener,noreferrer");
  }
}
