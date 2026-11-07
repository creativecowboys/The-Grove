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

export type Screen = {
  verdict: Verdict;
  reasons: string[];
  score: number;
  /**
   * Things worth telling a person, which must NOT move the verdict. They go
   * into the "[Check]" banner on the email alongside a suspect's reasons.
   *
   * Kept out of the score deliberately: the score is what holds a submission
   * back, and a new weak signal that adds to an existing one would start
   * crossing the score >= 2 line on real couples — which is what this file was
   * rewritten in Oct 2026 to stop doing.
   */
  notes: string[];
};

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

// --------------------------------------------------- selling to the venue
//
// The lists above score the pitch EVERY small business gets: SEO, web design,
// loans, card processing, "venues like yours". They do not describe the pitch
// THIS business gets. What reaches a venue's inquiry form is somebody in the
// wedding trade selling to the venue — photographers, DJs, florists, planners,
// caterers, bar staff, photo booths, linen and rental suppliers, staffing
// agencies, venue booking software, directory listings, commission booking
// platforms, influencer "styled shoot in exchange for exposure" asks — plus
// what any rural property gets: paving, tree work, solar, insurance. Twenty
// realistic ones were run against the deployed filter on 2026-11-06 and
// seventeen came back clean: emailed to Christy, pushed to GoHighLevel, texted.
// None of them mention SEO.
//
// The hard part is that a vendor pitch and a real inquiry share a vocabulary.
// A couple writes "our photographer", "our caterer", "your vendors"; the
// photographer selling to the venue writes the same nouns. So nothing below
// keys on the trade words, and nothing keys on who somebody says they are — a
// florist can be getting married too. A solicitation is recognised by SHAPE:
//
//   somebody offering to do something ("we provide", "let us", "our crew
//   does", "added to your preferred vendor list")
//   + aimed at the venue as a business ("your venue", "your couples", "your
//     property", "venues like yours")
//   + no sign they want an event of their own here.
//
// The last clause is the safety catch and the one that matters most. A couple
// repeating a pitch made to THEM uses every word a vendor uses, and the
// deployed filter held exactly that back as spam. Anyone who says they want to
// marry here, host here, tour, or check a date is a customer, full stop,
// whatever else is in the message.

export type VenueVerdict = "pitch" | "check" | "clean";

/* They want an event of their own at The Grove — the one thing a vendor
   selling to the venue never says. Deliberately broad: a missed solicitation
   costs Christy a delete, a missed couple costs her a wedding. Covers the
   two-word inquiries ("availability please") that are real leads, and the
   corporate wording the form's "corporate" event type produces. */
const OWN_EVENT =
  /\b(we('| a)?re getting married|getting married|our wedding|my wedding|own wedding|my (daughter|son|niece|nephew|sister|brother|cousin|best friend)'?s?( is| are)? ?(getting married|wedding)|my (fianc|bride|groom|husband|wife)|we got engaged|(he|she|they) proposed|our (ceremony|reception|rehearsal|big day|guests|date|event|party|wedding)|rehearsal dinner|we (want|'d like|would like|are hoping|hope|plan|are looking) to (host|have|book|get married|rent|reserve|see|tour|visit|come)|(we are|we're|i am|i'm) looking for a venue|looking for a venue|book (the|your) (venue|property|barn|space|date)|book (directly|with you|here)|rather (just )?book|(check|checking) (on )?availability|availability|(is|are) (that|this|the|it|those|these) (date|day|weekend|month|year)s? (still )?(open|available|free)|(is|are) (\w+ )?(\d{4}|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december|spring|summer|fall|autumn|winter)( \d{4})? (still )?(open|available|free)|(come|can we|could we|may we|we'd love to) (tour|visit|walk|see|come)|tour the (venue|property|barn)|walk the property|schedule a (tour|visit|showing)|hold (a|the|our) date|company (holiday )?(party|dinner|event)|(staff|team|employee) (appreciation|holiday|christmas) (party|dinner)|do we have to|can we bring|bring our own|how many guests|guest count)\b/i;

/* First person, offering to do something. The pronoun is required: "can your
   caterer provide linens" is a couple asking a question, "we can provide
   linens" is a supplier. Saying what you ARE is deliberately not an offer —
   "I'm a florist" is how a florist planning her own wedding opens. */
const PITCH_ACTOR =
  "(?:we|i|our (?:company|team|crew|agency|studio|staff|business|firm|platform|software|service|product|app|tool|system))";
const PITCH_MODAL = "(?:\\s+(?:can|could|would|will|also|currently|only|just|happily|already))*";
const PITCH_DOES =
  "(?:offers?|provides?|supply|supplies|rents?|installs?|handles?|covers?|staffs?|serves?|services?|delivers?|builds?|built|runs?|manages?|do|does|specialize[sd]?|specialise[sd]?|works? with|partners?|helps?|saves?|lowers?|reduces?|sends?|brings?|gives?|repaves?|seals?|takes? a look)";

const VENUE_OFFER = new RegExp(
  [
    `\\b${PITCH_ACTOR}${PITCH_MODAL}\\s+${PITCH_DOES}\\b`,
    "\\blet (?:us|me)\\b",
    "\\ballow (?:us|me) to\\b",
    "\\b(?:we|i)(?:'d| would| will| can)?\\s*(?:love|like)\\s+to\\s+(?:work with|partner|be|become|becoming|join|supply|provide|offer|discuss|add|get|show|send|help)\\b",
    "\\b(?:be|get) added to (?:your|the)\\b",
    "\\badd (?:us|me|my \\w+) to (?:your|the)\\b",
    "\\bbecom(?:e|ing) one of your\\b",
    "\\bbe on your\\b",
    "\\b(?:preferred|approved|recommended|go-to) (?:vendor|caterer|florist|photographer|dj|planner|bartender|bar)s?(?: list| staff)?\\b",
    "\\breferral (?:relationship|partnership|program)\\b",
    "\\brevenue share\\b",
    "\\bcommission (?:per|on each|on every|for each) booking\\b",
    "\\bin exchange for (?:exposure|a tag|tagged|promotion|posts?|content|coverage)\\b",
    "\\b(?:featured|premium|enhanced|sponsored) listing\\b",
    "\\bfree (?:estimate|assessment|consultation|quote|audit|demo|trial|tasting)\\b",
    "\\b(?:show|give|walk) you (?:a|our|through a)(?: quick)? (?:demo|walkthrough|presentation|look)\\b",
    "\\bsend (?:over |you |across )?(?:our|my|the) (?:packages?|pricing|rate sheet|catalog|catalogue|portfolio|deck|info|information|brochure|statement)\\b",
    "\\bwho (?:at|handles|is in charge of|takes care of|looks after)\\b",
    "\\bno (?:upfront|up-front) cost\\b",
    "\\bonly pay (?:a|per|when)\\b",
  ].join("|"),
  "i"
);

/* The venue addressed as a business to be sold to. "your property", not "the
   property" — a couple says "the property", "the barn", "the venue". */
const VENUE_TARGET =
  /\b(your (venue|property|barn|land|farm|site|business|company|events?|weddings?|bookings?|calendar|clients?|couples?|brides?|grooms?|customers?|vendors?|vendor list|staff|team|website|web ?site|rates?|policy|insurance|drive|driveway|parking|roof|trees?|lawn|grounds)|venues? like yours|businesses like yours|companies like yours|for (your|the) (venue|couples?|brides?|clients?)|for (wedding )?venues?\b|(wedding )?venues? (across|in|around|throughout)|venues? (owners?|managers?|directors?)|events? at your\b|weddings? at your\b)/i;

/* Shapes no customer produces, so one is enough on its own. Still outranked
   by OWN_EVENT — a couple quoting one of these is a customer. */
const VENUE_STANDALONE =
  /\b((featured|premium|enhanced|sponsored) listing|revenue share|commission (per|on each|on every|for each) booking|in exchange for (exposure|a tag|tagged|promotion|posts?|content|coverage)|styled shoot (at|on) your|(be|get) (added to|on) your (preferred|approved|recommended)|(preferred|approved|recommended) (vendor|caterer|florist|photographer|dj|planner|bartender)s? list|referral (relationship|partnership|program)|(show|give|walk) you (a|our|through a)( quick)? (demo|walkthrough|presentation)|who (at|handles)[^.?!]{0,40}\b(marketing|booking|bookings|purchasing|advertising|operations|vendor)|no (upfront|up-front) cost)\b/i;

/**
 * Does this ask for an event of their own at The Grove?
 *
 * Used by the generic screen too: its "venues like yours" rule fires on a
 * couple REPEATING a pitch, and that must soften to [Check], never hold the
 * couple back.
 */
export function wantsTheirOwnEvent(text: string): boolean {
  return OWN_EVENT.test(String(text || ""));
}

/**
 * Screen one submission for a pitch aimed at the venue.
 *
 * `pitch` — confident: an offer, aimed at the venue, no event of their own.
 * `check`  — half the shape only (an offer with no venue target, or the other
 *            way round). Reported, deliberately NOT scored — see contentSignals.
 * `clean`  — nothing, or they want an event here.
 */
export function screenVenuePitch(...fields: (string | undefined)[]): {
  verdict: VenueVerdict;
  reasons: string[];
  /** Said out loud but never scored. See `notes` on Screen. */
  notes: string[];
} {
  const text = fields.filter(Boolean).join("\n");
  if (!text.trim()) return { verdict: "clean", reasons: [], notes: [] };

  // A customer outranks every rule below. This is the whole safety catch, and
  // it is cheap to defeat: a solicitor who adds "we are getting married next
  // June" to the pitch is delivered. That is the deliberate trade — Christy
  // deletes a pitch in two seconds and cannot recover a lost couple — but the
  // hybrid is worth pointing at, so it goes out tagged rather than silently.
  if (wantsTheirOwnEvent(text)) {
    const shape = pitchShape(text);
    return {
      verdict: "clean",
      reasons: [],
      notes: shape.verdict === "pitch" ? ["asks for an event here, but also reads like a vendor's offer"] : [],
    };
  }

  return { ...pitchShape(text), notes: [] };
}

/** The rules, with no customer override applied. */
function pitchShape(text: string): { verdict: VenueVerdict; reasons: string[] } {
  if (VENUE_STANDALONE.test(text)) {
    return { verdict: "pitch", reasons: ["selling to the venue (vendor or listing offer)"] };
  }

  const offer = VENUE_OFFER.test(text);
  const target = VENUE_TARGET.test(text);

  if (offer && target) {
    return { verdict: "pitch", reasons: ["selling to the venue (offer aimed at the venue)"] };
  }
  if (offer || target) {
    return {
      verdict: "check",
      reasons: [offer ? "reads like an offer, not an inquiry" : "addresses the venue as a business"],
    };
  }
  return { verdict: "clean", reasons: [] };
}

export function contentSignals(lead: ScreenInput): Signal[] {
  const out: Signal[] = [];
  const msg = lead.message;

  // A couple repeating a pitch somebody made to THEM writes it in a vendor's
  // words — "a vendor said they could get us a discount on venues like yours,
  // we'd rather book with you directly". That tripped the strong rule and was
  // held back. If they want an event here they are a customer: deliver it
  // tagged "[Check]" instead. This can only soften a verdict, never harden one.
  if (PITCH_STRONG.test(msg)) {
    out.push(
      wantsTheirOwnEvent(msg)
        ? { reason: "sales-pitch wording, but they want an event here", weight: 1 }
        : { reason: "sales pitch (SEO/marketing/finance)", weight: 2 }
    );
  } else if (PITCH_WEAK.test(msg)) out.push({ reason: "possible sales pitch", weight: 1 });

  // Pitches aimed at a wedding venue, which the list above does not describe:
  // vendors wanting on the preferred list, directory listings, commission
  // platforms, suppliers, staffing, and property solicitations to the farm.
  // Only the confident verdict is scored. A `check` is left unscored on
  // purpose: a new weak signal could add to an existing one and cross the
  // score >= 2 line, which would start holding back the real couples this
  // file was rewritten in Oct 2026 to stop losing.
  const venue = screenVenuePitch(msg, lead.companyName);
  if (venue.verdict === "pitch") out.push({ reason: venue.reasons[0], weight: 2 });

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
  // Pure and cheap, so running it here as well as inside contentSignals costs
  // nothing. Notes never touch the score — see the comment on Screen.
  const notes = screenVenuePitch(lead.message, lead.companyName).notes;
  if (hard.length) return { verdict: "spam", reasons, score: score + 10, notes };
  return { verdict: score >= 2 ? "spam" : score === 1 ? "suspect" : "clean", reasons, score, notes };
}
