// Spam screening for the inquiry form (/api/inquiry).
//
// Two kinds of check:
//   1. Request checks (bot fingerprints): known bot sender, honeypot filled,
//      no form timing at all, submitted too fast, posted from a foreign page,
//      too many posts from one address, fields that aren't text. Any one of
//      these marks the submission as spam.
//   2. Content checks: scored. Strong signals weigh 2, weak signals weigh 1.
//      Score >= 2 is spam, 1 is "suspect" (still delivered, email subject
//      starts with "[Check]"), 0 is clean.
//
// Spam is never emailed, sent to GHL or texted, but it is kept in the private
// Blob store under spam/ so a false positive can be recovered (see
// leadLog.ts). The visitor sees the same "thank you" either way.
//
// The bot this site actually gets (Sep–Oct 2026) fills the hidden honeypot,
// uses a random-case name ("XMnDseQzsBCIxBhMETllLBQo"), a dot-tricked gmail
// (x.eq.on.o.bi.m.1.11@gmail.com), a bare phone number as the message and a
// "preferred date" that isn't one. Each of those is a weak signal on its own,
// because a real couple can trip one of them; the bot trips several.
//
// What changed in Oct 2026 and why: the old filter made one odd-looking name
// decisive and added up things real couples do (their own phone number in the
// message, "Christmas" as the date, all caps), with nothing kept but a log
// line. On Arctic Law the same family of rules silently dropped a real lead
// twice.
//
// This file is pure (no Next, no Node-only imports) so it can be unit-tested
// with `npm run test:spam` (tests/spam.test.mjs).

export type Verdict = "clean" | "suspect" | "spam";

export type ScreenInput = {
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredDate: string;
  brideName?: string;
  groomName?: string;
  companyName?: string;
};

export type RequestFacts = {
  /** Value of the hidden "website" field; undefined when the post didn't send it. */
  honeypot: string | undefined;
  /** Milliseconds between the form opening and submit, as the form reports it. */
  formAge: unknown;
  /** True when Origin/Referer is one of our own pages. */
  originOk: boolean;
  /** True when this address has posted too many times recently. */
  rateLimited: boolean;
  /** True when a field the real form always sends as text arrived as something else. */
  malformed: boolean;
};

export type Screen = { verdict: Verdict; reasons: string[]; score: number };

export const MIN_FORM_MS = 3000;

const digits = (s: string) => String(s || "").replace(/\D/g, "");
const tenDigits = (s: string) => digits(s).replace(/^1(?=\d{10}$)/, "");

// ---------------------------------------------------------------- requests

/** Known repeat offenders. Emails and domains are case-insensitive; phones are digits only. */
const BLOCKED_EMAILS = ["sif.u.f.ufo.v.o.t.i.5.6@gmail.com"];
const BLOCKED_DOMAINS = ["zacharyjackson.rocks", "adsmogul.com"];
const BLOCKED_PHONES = ["2825361367", "9497950807"];

export function blockedSender(lead: ScreenInput) {
  const email = lead.email.trim().toLowerCase();
  const domain = email.split("@")[1] ?? "";
  const phone = tenDigits(lead.phone);
  return BLOCKED_EMAILS.includes(email) || BLOCKED_DOMAINS.includes(domain) || (phone !== "" && BLOCKED_PHONES.includes(phone));
}

export function requestReasons(f: RequestFacts): string[] {
  const reasons: string[] = [];
  if (f.honeypot === undefined) reasons.push("posted without the form's fields");
  else if (f.honeypot.trim()) reasons.push("honeypot filled");
  if (typeof f.formAge !== "number" || !Number.isFinite(f.formAge)) reasons.push("no form timing (posted directly)");
  else if (f.formAge < MIN_FORM_MS) reasons.push(`submitted in ${Math.max(0, Math.round(f.formAge))}ms`);
  if (!f.originOk) reasons.push("not posted from thegroveatdefoorfarm.com");
  if (f.rateLimited) reasons.push("too many submissions from one address");
  if (f.malformed) reasons.push("malformed fields");
  return reasons;
}

// ---------------------------------------------------------------- content

type Signal = { reason: string; weight: 1 | 2 };

// Whole words and phrases only: a bare substring test matches "seo" or "hmu"
// inside longer words.
const PITCH_STRONG =
  /\b(seo|search engine optimi[sz]ation|backlinks?|guest posts?|link building|domain authority|first page of google|page one of google|google rankings?|rank your (site|website|business|venue)|rank higher|website traffic|lead generation|generate (more )?leads|appointment setting|virtual assistants?|merchant cash( advance)?|business (loans?|funding)|web design services|website design services|app development|digital marketing|social media management|unsubscribe|opt[- ]out|reply stop|businesses like yours|companies like yours|venues like yours|makes? you rich|(new )?customers 24\/7)\b/i;
const PITCH_WEAK =
  /\b(mobile app|content creation|email list|cold email|boost your|grow your business|increase your (sales|revenue|bookings)|my program|hmu|crypto(currency)?|bitcoin|marketing agency)\b/i;

const SKETCHY_TLDS = /\.(rocks|xyz|top|click|buzz|icu|online|site|website|work|club|monster|cam|rest|bar)$/i;
const TOLL_FREE = /^8(00|33|44|55|66|77|88)/;

/** Words a person puts in "Preferred Date / Season" that aren't digits. */
const DATE_WORDS =
  /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december|spring|summer|fall|autumn|winter|season|weekend|weekday|saturday|sunday|friday|thursday|monday|tuesday|wednesday|morning|afternoon|evening|night|day|week|month|year|date|holiday|christmas|xmas|thanksgiving|easter|halloween|valentine'?s?|new year'?s?|memorial|labor|independence|tbd|tba|flexible|open|undecided|not sure|unsure|don'?t know|any|anytime|asap|soon|next|this|early|late|mid)\b/i;

function linkCount(text: string) {
  return (text.match(/https?:\/\/|\bwww\./gi) || []).length;
}

// Gibberish: only the shapes bots actually produce. Random-case strings
// ("XMnDseQzsBCIxBhMETllLBQo"), long runs with no vowel at all. Words with
// digits or punctuation are never judged, and real names ("McKenzie",
// "DeAndre", "VanDerWal", "JoAnnMarie") and words like "church" or
// "Armstrong" pass. Consonant runs need 7 so "Knightsbridge" passes too.
function caseFlips(word: string) {
  let flips = 0;
  for (let i = 1; i < word.length; i++) if (/[a-z]/.test(word[i - 1]) && /[A-Z]/.test(word[i])) flips += 1;
  return flips;
}
// Real CamelCase ("GreenSkyEventPlanning", "McDonaldMcKenzie") is whole words
// glued together; random case is mostly one- or two-letter lowercase runs.
function randomCase(word: string) {
  if (word.length < 8 || caseFlips(word) < 3) return false;
  const runs = word.match(/[a-z]+/g) || [];
  return runs.filter((r) => r.length <= 2).length / runs.length > 0.6;
}
function maxConsonantRun(word: string) {
  let run = 0;
  let max = 0;
  for (const ch of word.toLowerCase()) {
    if (/[a-z]/.test(ch) && !/[aeiouy]/.test(ch)) max = Math.max(max, ++run);
    else run = 0;
  }
  return max;
}
function gibberishWord(raw: string) {
  const w = raw.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "");
  if (w.length < 5 || !/^[A-Za-z]+$/.test(w)) return false;
  if (randomCase(w)) return true;
  if (maxConsonantRun(w) >= 7) return true;
  if (!/[aeiouy]/i.test(w)) return true;
  return false;
}
export function looksGibberish(text: string) {
  return String(text || "")
    .split(/\s+/)
    .some(gibberishWord);
}

export function contentSignals(lead: ScreenInput): Signal[] {
  const out: Signal[] = [];
  const msg = lead.message;

  if (PITCH_STRONG.test(msg)) out.push({ reason: "sales pitch (SEO/marketing/finance)", weight: 2 });
  else if (PITCH_WEAK.test(msg)) out.push({ reason: "possible sales pitch", weight: 1 });

  const links = linkCount(msg);
  if (/\[url=|<a\s+href/i.test(msg) || links >= 3) out.push({ reason: "link-stuffed message", weight: 2 });
  else if (links > 0) out.push({ reason: "link in message", weight: 1 });

  // One odd-looking name could be a typo or an unusual spelling; two random
  // names on one inquiry is a bot.
  const names: [string, string | undefined][] = [
    ["name", lead.name],
    ["bride's name", lead.brideName],
    ["groom's name", lead.groomName],
    ["company", lead.companyName],
  ];
  const gibberish = names.filter(([, v]) => v && looksGibberish(v)).map(([k]) => k);
  if (gibberish.length) out.push({ reason: `random-string ${gibberish.join(", ")}`, weight: gibberish.length >= 2 ? 2 : 1 });
  if (looksGibberish(msg)) out.push({ reason: "gibberish message", weight: 1 });

  if (msg.trim() && msg.replace(/[\d\s().+\-]/g, "").length === 0) out.push({ reason: "message is only a phone number", weight: 1 });

  const date = lead.preferredDate.trim();
  if (date && !/\d/.test(date) && !DATE_WORDS.test(date)) out.push({ reason: "preferred date isn't a date", weight: 1 });

  const [local = "", domain = ""] = lead.email.trim().toLowerCase().split("@");
  if (domain === "gmail.com" && (local.match(/\./g) || []).length >= 4) out.push({ reason: "dot-tricked gmail address", weight: 1 });
  if (domain && SKETCHY_TLDS.test(domain)) out.push({ reason: `unusual email domain (.${domain.split(".").pop()})`, weight: 1 });

  if (TOLL_FREE.test(tenDigits(lead.phone))) out.push({ reason: "toll-free phone number", weight: 1 });

  return out;
}

export function screen(lead: ScreenInput, facts: RequestFacts): Screen {
  const hard = [...(blockedSender(lead) ? ["blocked sender"] : []), ...requestReasons(facts)];
  const signals = contentSignals(lead);
  const score = signals.reduce((n, s) => n + s.weight, 0);
  const reasons = [...hard, ...signals.map((s) => s.reason)];
  if (hard.length) return { verdict: "spam", reasons, score: score + 10 };
  return { verdict: score >= 2 ? "spam" : score === 1 ? "suspect" : "clean", reasons, score };
}
