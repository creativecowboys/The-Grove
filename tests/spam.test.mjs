import test from "node:test";
import assert from "node:assert/strict";
import { screen, looksGibberish, MIN_FORM_MS } from "../lib/spam.ts";
import { originAllowed, overLimit } from "../lib/guard.ts";

// A normal post from our own form.
const ok = { honeypot: "", formAge: 90_000, originOk: true, rateLimited: false, malformed: false };
const inquiry = (over = {}) => ({
  name: "Jordan Example",
  email: "jordan.example@gmail.com",
  phone: "(770) 555-0134",
  message: "We're getting married next fall and would love to tour the venue.",
  preferredDate: "October 2027",
  brideName: "Jordan Example",
  groomName: "Casey Example",
  companyName: "",
  ...over,
});
const verdict = (i, f = ok) => screen(inquiry(i), f).verdict;

// Real-couple shapes. Every one of these must reach Christy (clean or
// [Check]), never be held back. Several were dropped by the old filter.
const REAL = [
  {},
  // old filter: non-date "Christmas" (+1) + phone repeated in message (+1) = dropped
  { preferredDate: "Christmas", message: "Please call me at 770-555-0134, we'd love a Christmas wedding!" },
  // old filter: all caps (+1) + phone repeated (+1) = dropped
  { message: "HI MY DAUGHTER IS GETTING MARRIED, CALL ME 770 555 0134 THANK YOU SO MUCH" },
  // old filter: one name with 4 case flips was decisive
  { companyName: "GreenSkyEventPlanningLLC", name: "Sam Example", brideName: "", groomName: "" },
  // old filter: dot-trick gmail (+2) = dropped
  { email: "j.r.r.tolkien.fan@gmail.com" },
  // old filter: "message is only a phone number" (+2) = dropped
  { message: "770-555-0134" },
  // old filter: preferred date not a date (+1) + toll-free (+2)
  { preferredDate: "Valentine's weekend", phone: "888-555-0100" },
  // Arctic Law words
  { name: "Armstrong", message: "Our church group of things for the 1950s themed party, about $30k budget." },
  { name: "Knightsbridge", message: "Hoping to see the chapel." },
  { message: "Our contractor friend recommended you. Photos of our inspiration: https://pin.it/abc123" },
];

test("real couples are never held back", () => {
  for (const r of REAL) {
    const s = screen(inquiry(r), ok);
    assert.notEqual(s.verdict, "spam", `held back: ${JSON.stringify(r)} → ${s.reasons.join("; ")}`);
  }
});

test("plain inquiries are clean", () => {
  assert.equal(verdict({}), "clean");
  assert.equal(verdict({ preferredDate: "Christmas" }), "clean");
  assert.equal(verdict({ preferredDate: "not sure yet" }), "clean");
});

test("one soft signal is delivered with [Check], not dropped", () => {
  assert.equal(verdict({ message: "770-555-0134" }), "suspect");
  assert.equal(verdict({ preferredDate: "whenever works" }), "suspect");
});

test("the Sep–Oct 2026 bot is held back on content alone", () => {
  // Sep 20 shape: random-case names, dot-tricked gmail, phone-only message, non-date date.
  assert.equal(
    verdict({
      name: "OPhZAAIXHZqQiSbgTbNypafa",
      brideName: "XMnDseQzsBCIxBhMETllLBQo",
      groomName: "qWeRtYuIoPaSdF",
      email: "x.eq.on.o.bi.m.1.11@gmail.com",
      message: "3235550187",
      preferredDate: "LkjhGfdsa",
    }),
    "spam"
  );
  // Any two of its fingerprints are enough.
  assert.equal(verdict({ name: "OPhZAAIXHZqQiSbgTbNypafa", email: "x.eq.on.o.bi.m.1.11@gmail.com" }), "spam");
});

test("pitch spam is held back", () => {
  assert.equal(verdict({ message: "We help venues like yours rank higher on Google with our SEO services." }), "spam");
  assert.equal(verdict({ message: "a https://a.example b https://b.example c https://c.example" }), "spam");
});

test("known bot senders are held back", () => {
  assert.equal(verdict({ email: "sif.u.f.ufo.v.o.t.i.5.6@gmail.com" }), "spam");
  assert.equal(verdict({ phone: "282-536-1367" }), "spam");
});

test("request checks are decisive", () => {
  assert.equal(verdict({}, { ...ok, honeypot: "x" }), "spam");
  assert.equal(verdict({}, { ...ok, honeypot: undefined }), "spam");
  assert.equal(verdict({}, { ...ok, formAge: undefined }), "spam");
  assert.equal(verdict({}, { ...ok, formAge: MIN_FORM_MS - 1 }), "spam");
  assert.equal(verdict({}, { ...ok, formAge: MIN_FORM_MS }), "clean");
  assert.equal(verdict({}, { ...ok, originOk: false }), "spam");
  assert.equal(verdict({}, { ...ok, rateLimited: true }), "spam");
  assert.equal(verdict({}, { ...ok, malformed: true }), "spam");
});

test("gibberish only catches bot-shaped strings", () => {
  assert.equal(looksGibberish("XMnDseQzsBCIxBhMETllLBQo"), true);
  assert.equal(looksGibberish("OPhZAAIXHZqQiSbgTbNypafa"), true);
  assert.equal(looksGibberish("qWeRtYuIoPaSdF"), true);
  for (const w of ["Armstrong", "church", "things", "1950s", "$30k", "Knightsbridge", "McKenzie", "DeAndre", "VanDerWal", "JoAnnMarie", "Nguyen", "GreenSkyEventPlanningLLC", "McDonaldMcKenzie"]) {
    assert.equal(looksGibberish(w), false, w);
  }
});

test("origin check accepts our pages and same-host previews only", () => {
  const req = (h) => new Request("https://thegroveatdefoorfarm.com/api/inquiry", { method: "POST", headers: h });
  assert.equal(originAllowed(req({ origin: "https://thegroveatdefoorfarm.com" })), true);
  assert.equal(originAllowed(req({ origin: "https://www.thegroveatdefoorfarm.com" })), true);
  assert.equal(originAllowed(req({ referer: "https://thegrove.creativecowboys.co/contact" })), true);
  assert.equal(originAllowed(req({ origin: "https://the-grove-git-x.vercel.app", host: "the-grove-git-x.vercel.app" })), true);
  assert.equal(originAllowed(req({ origin: "https://evil.example" })), false);
  assert.equal(originAllowed(req({})), false);
});

test("rate limit allows a few resubmits, stops a flood", () => {
  const rules = [{ windowMs: 600_000, max: 5 }];
  for (let i = 0; i < 5; i++) assert.equal(overLimit("t", "1.2.3.4", rules, 1_000 + i), false);
  assert.equal(overLimit("t", "1.2.3.4", rules, 1_010), true);
});
