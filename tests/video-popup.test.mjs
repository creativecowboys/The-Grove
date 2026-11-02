import test from "node:test";
import assert from "node:assert/strict";
import {
  seenRecently,
  markSeen,
  VIDEO_POPUP_KEY,
  VIDEO_POPUP_QUIET_MS,
} from "../lib/video-popup.ts";

const NOW = 1_800_000_000_000;

function memoryStore(initial) {
  const values = new Map(initial === undefined ? [] : [[VIDEO_POPUP_KEY, initial]]);
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, value),
  };
}

const blocked = () => {
  throw new Error("SecurityError: storage is blocked");
};

test("a first-time visitor has not seen it", () => {
  const store = memoryStore();
  assert.equal(seenRecently(() => store, NOW), false);
});

test("stays away for 7 days after being seen", () => {
  const store = memoryStore();
  markSeen(() => store, NOW);
  assert.equal(seenRecently(() => store, NOW), true);
  assert.equal(seenRecently(() => store, NOW + VIDEO_POPUP_QUIET_MS - 1), true);
});

test("comes back once the 7 days are up", () => {
  const store = memoryStore();
  markSeen(() => store, NOW);
  assert.equal(seenRecently(() => store, NOW + VIDEO_POPUP_QUIET_MS), false);
});

test("a garbled or future stamp does not count as seen", () => {
  for (const bad of ["", "soon", "0", "-5", "NaN", String(NOW + 1000)]) {
    const store = memoryStore(bad);
    assert.equal(seenRecently(() => store, NOW), false, `value ${JSON.stringify(bad)}`);
  }
});

test("blocked storage neither throws nor suppresses the popup", () => {
  assert.equal(seenRecently(blocked, NOW), false);
  assert.doesNotThrow(() => markSeen(blocked, NOW));
});

test("a store that refuses writes does not throw", () => {
  const refuses = {
    getItem: () => null,
    setItem: () => {
      throw new Error("QuotaExceededError");
    },
  };
  assert.doesNotThrow(() => markSeen(() => refuses, NOW));
});
