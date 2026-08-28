/**
 * Adsterra Smartlink Configuration
 * Key: e3577dc8038eab2cc7d5221531c0f23f (Smartlink_1 - 30968716)
 */
export const ADSTERRA_SMARTLINK_URL =
  "https://www.profitableratecpmnetwork.com/mbhhhzyzh?key=e3577dc8038eab2cc7d5221531c0f23f";

export function openSmartlink(target = "_blank") {
  if (typeof window !== "undefined") {
    window.open(ADSTERRA_SMARTLINK_URL, target, "noopener,noreferrer");
  }
}
