/**
 * Inquiry spam assessment. Ported from the Whiten Pools filter and tuned for
 * the bot traffic The Grove actually gets (Sep 2026): random-string names,
 * dot-tricked gmail addresses, a bare phone number as the "message", and a
 * "preferred date" that isn't a date. All layers are invisible to real couples.
 *
 *  1. Honeypot  — the form renders a hidden "website" field no human can see.
 *  2. Timing    — the form reports how long the visitor took. Sub-4s is a machine.
 *  3. Content   — gibberish fingerprints + mass-blast pitch fingerprints.
 *
 * Scoring is cumulative; SPAM_THRESHOLD or more marks the inquiry as spam.
 * A flagged inquiry is logged server-side and acknowledged to the sender
 * exactly like a real one, but delivered nowhere (no email, no GHL).
 */

const SPAM_THRESHOLD = 2;

const PITCH_PHRASES = [
  "virtual assistant",
  "seo services",
  "seo writing",
  "search engine optimization",
  "rank your website",
  "rank higher",
  "boost your",
  "grow your business",
  "increase your sales",
  "increase your revenue",
  "web design services",
  "website design services",
  "app development",
  "mobile app",
  "digital marketing",
  "social media management",
  "content creation",
  "lead generation",
  "generate leads",
  "business loan",
  "business funding",
  "merchant cash",
  "guest post",
  "backlink",
  "domain authority",
  "cold email",
  "email list",
  "reply stop",
  "to unsubscribe",
  "unsubscribe",
  "opt out",
  "opt-out",
  "businesses like yours",
  "companies like yours",
  "venues like yours",
  "make you rich",
  "new customers 24/7",
  "customers 24/7",
  "my program",
  "hmu",
];

/** Known repeat offenders — decisive on their own. */
const BLOCKED_EMAILS: string[] = ["sif.u.f.ufo.v.o.t.i.5.6@gmail.com"];
const BLOCKED_DOMAINS: string[] = ["zacharyjackson.rocks", "adsmogul.com"];
const BLOCKED_PHONES: string[] = ["2825361367", "9497950807"];

const SKETCHY_TLDS = /\.(rocks|xyz|top|click|buzz|icu|online|site|website|work|club|monster|cam|rest|bar)$/i;
const PROFANITY = /\b(fuck\w*|shit\w*|bitch\w*|asshole\w*)\b/i;
const TOLL_FREE = /^\s*(\+?1[\s\-.]*)?\(?8(00|33|44|55|66|77|88)\)?/;
const URL_IN_MESSAGE = /(https?:\/\/|www\.)\S+/i;

/** Words a human puts in "Preferred Date / Season" that aren't digits. */
const DATE_WORDS =
  /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december|spring|summer|fall|autumn|winter|weekend|saturday|sunday|friday|tbd|flexible|open|undecided|not sure|unsure|anytime|asap|next year|this year|early|late|mid)\b/i;

/**
 * Random-string detector for name fields. Real names ("Mary Beth", "DeAndre",
 * "O'Neal", "McKenzie") have at most a couple of case flips and always have
 * vowels. Bot fill ("OPhZAAIXHZqQiSbgTbNypafa") flips case constantly.
 */
function looksLikeGibberish(value: string): boolean {
  const tokens = value.split(/[\s\-']+/).filter(Boolean);
  for (const t of tokens) {
    const letters = t.replace(/[^A-Za-z]/g, "");
    if (letters.length < 7) continue;
    let flips = 0;
    for (let i = 1; i < letters.length; i++) {
      const a = letters[i - 1] === letters[i - 1].toUpperCase();
      const b = letters[i] === letters[i].toUpperCase();
      if (a !== b) flips++;
    }
    if (flips >= 4) return true;
    if (!/[aeiouy]/i.test(letters)) return true;
  }
  return false;
}

export type SpamAssessment = {
  spam: boolean;
  score: number;
  reasons: string[];
};

export function assessInquiry(input: {
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredDate: string;
  brideName?: string;
  groomName?: string;
  companyName?: string;
  /** Honeypot field value; undefined when the POST skipped the form entirely. */
  honeypot: string | undefined;
  /** Milliseconds the visitor spent on the form, as reported by the client. */
  elapsedMs: number | undefined;
}): SpamAssessment {
  const reasons: string[] = [];
  let score = 0;

  // Layer 0 — known senders. Decisive.
  const emailLc = (input.email ?? "").trim().toLowerCase();
  const [emailLocal = "", emailDomain = ""] = emailLc.split("@");
  const phoneDigits = (input.phone ?? "").replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  if (
    BLOCKED_EMAILS.includes(emailLc) ||
    BLOCKED_DOMAINS.includes(emailDomain) ||
    (phoneDigits && BLOCKED_PHONES.includes(phoneDigits))
  ) {
    return { spam: true, score: SPAM_THRESHOLD, reasons: ["blocked sender"] };
  }

  // Layer 1 — honeypot. Decisive.
  if (input.honeypot && input.honeypot.trim() !== "") {
    return { spam: true, score: SPAM_THRESHOLD, reasons: ["honeypot filled"] };
  }
  if (input.honeypot === undefined) {
    // The form always sends the field (empty). A POST without it didn't come
    // from our form — suspicious, not decisive, so a cached pre-rollout page
    // can't strand a real couple.
    score += 1;
    reasons.push("posted without form fields");
  }

  // Layer 2 — timing.
  if (typeof input.elapsedMs === "number" && input.elapsedMs >= 0 && input.elapsedMs < 4000) {
    score += 2;
    reasons.push(`submitted in ${Math.round(input.elapsedMs)}ms`);
  }

  // Layer 3 — gibberish fingerprints (the Sep 2026 bot).
  const nameFields: [string, string | undefined][] = [
    ["name", input.name],
    ["bride's name", input.brideName],
    ["groom's name", input.groomName],
    ["company", input.companyName],
  ];
  const gibberish = nameFields.filter(([, v]) => v && looksLikeGibberish(v)).map(([k]) => k);
  if (gibberish.length) {
    score += Math.min(gibberish.length, 2) + 1; // one gibberish name is already decisive
    reasons.push(`random-string ${gibberish.join(", ")}`);
  }

  const date = (input.preferredDate ?? "").trim();
  if (date && !/\d/.test(date) && !DATE_WORDS.test(date)) {
    score += 1;
    reasons.push("preferred date isn't a date");
  }

  const msgRaw = input.message ?? "";
  const msgStripped = msgRaw.replace(/[\d\s().+\-]/g, "");
  if (msgRaw.trim() && msgStripped.length === 0) {
    score += 2;
    reasons.push("message is only a phone number");
  }

  // Gmail dot-trick addresses (s.i.f.u.f.o@gmail.com) are a blast fingerprint.
  if (emailDomain === "gmail.com" && (emailLocal.match(/\./g) || []).length >= 4) {
    score += 2;
    reasons.push("dot-tricked gmail address");
  }

  // Layer 4 — mass-blast pitch rules.
  const message = msgRaw.toLowerCase();
  const hits = PITCH_PHRASES.filter((p) => message.includes(p));
  if (hits.length > 0) {
    score += Math.min(hits.length, 3);
    reasons.push(`pitch phrases: ${hits.slice(0, 5).join(", ")}`);
  }
  if (URL_IN_MESSAGE.test(msgRaw)) {
    score += 1;
    reasons.push("URL in message");
  }
  if (TOLL_FREE.test(input.phone ?? "")) {
    score += 2;
    reasons.push("toll-free phone number");
  }
  if (PROFANITY.test(msgRaw)) {
    score += 1;
    reasons.push("profanity");
  }
  const letters = msgRaw.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 30) {
    const upper = letters.replace(/[^A-Z]/g, "").length;
    if (upper / letters.length >= 0.9) {
      score += 1;
      reasons.push("all caps");
    }
  }
  if (emailDomain && SKETCHY_TLDS.test(emailDomain)) {
    score += 1;
    reasons.push(`sketchy email TLD (.${emailDomain.split(".").pop()})`);
  }
  const bodyDigits = msgRaw.replace(/\D/g, "");
  if (phoneDigits.length === 10 && bodyDigits.includes(phoneDigits)) {
    score += 1;
    reasons.push("phone repeated in message");
  }

  return { spam: score >= SPAM_THRESHOLD, score, reasons };
}
