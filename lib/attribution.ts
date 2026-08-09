/* First-touch marketing attribution. The visitor's original source (UTM
   params or referrer) is captured on whatever page they land on and kept in
   localStorage, so it survives browsing around before they reach the
   contact form. First touch wins — a return visit never overwrites how
   they originally found us. */

const KEY = "grove_attribution";

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  landing?: string;
  ts?: string;
};

export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const a: Attribution = {
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
      referrer: document.referrer || undefined,
      landing: window.location.pathname,
      ts: new Date().toISOString(),
    };
    // A direct visit with no referrer tells us nothing — don't burn the
    // first-touch slot on it; a later tagged visit may still come.
    if (!a.utm_source && !a.referrer) return;
    localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    // Storage unavailable (private mode etc.) — attribution is best-effort.
  }
}

export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}
