// The rule for how often the homepage video popup shows: once, then not again
// for 7 days after it was seen or closed.
//
// Reaching localStorage can itself throw (blocked site data, some private
// windows), so callers hand in a function and every touch is wrapped. When
// storage is unavailable the popup simply behaves as if it was never seen.

export const VIDEO_POPUP_KEY = "grove-video-popup-seen-at";
export const VIDEO_POPUP_QUIET_MS = 7 * 24 * 60 * 60 * 1000;

type PopupStore = Pick<Storage, "getItem" | "setItem">;

export function seenRecently(store: () => PopupStore, now: number): boolean {
  try {
    const seenAt = Number(store().getItem(VIDEO_POPUP_KEY));
    // A missing or garbled value reads as 0 / NaN, and a stamp from the future
    // means a clock changed. None of those count as seen.
    return seenAt > 0 && seenAt <= now && now - seenAt < VIDEO_POPUP_QUIET_MS;
  } catch {
    return false;
  }
}

export function markSeen(store: () => PopupStore, now: number): void {
  try {
    store().setItem(VIDEO_POPUP_KEY, String(now));
  } catch {
    // Storage is blocked. The popup still works, it just cannot remember.
  }
}
