// Solicitations aimed at the VENUE, and the real inquiries that must survive
// the rules that catch them. Companion to tests/spam.test.mjs, which covers
// the bot fingerprints and the generic pitch list.
//
// Why this file exists: on 2026-11-06 twenty realistic venue solicitations were
// run against the filter deployed on main (400b082). Seventeen came back clean
// — emailed to Christy, pushed to GoHighLevel, and texted — because every rule
// in the deployed list describes the pitch a business gets, not the pitch a
// wedding venue gets. One genuine couple, repeating a pitch somebody had made
// to THEM, was held back.
//
// Nothing here touches a network, a mailbox, GoHighLevel, Twilio or the Blob
// store. screen() is pure, so these are real assertions about what would and
// would not reach the venue.

import test from "node:test";
import assert from "node:assert/strict";
import { screen, screenVenuePitch, wantsTheirOwnEvent } from "../lib/spam.ts";
import { mayAcknowledgeHeldBack } from "../lib/leadLog.ts";

/** A normal post from our own form: no bot fingerprint to muddy the result. */
const ok = { honeypot: "", formAge: 90_000, originOk: true, rateLimited: false, malformed: false };

/* A solicitor who bothers to fill this form looks like any other post — the
   form requires an event type, a date, a guest count and bride/groom names,
   so only the words of the message differ. */
const sol = (message, over = {}) => ({
  name: "Mike Harrison",
  email: "mike@eliteweddingpros.com",
  phone: "(404) 555-0188",
  message,
  preferredDate: "June 2027",
  brideName: "Mike Harrison",
  groomName: "N/A",
  companyName: "",
  ...over,
});

const real = (message, over = {}) => ({
  name: "Jordan Example",
  email: "jordan.example@gmail.com",
  phone: "(770) 555-0134",
  message,
  preferredDate: "October 2027",
  brideName: "Jordan Example",
  groomName: "Casey Example",
  companyName: "",
  ...over,
});

// --------------------------------------------------------------------------
// Held back. Every one of these is somebody selling to the venue. None of them
// wants an event at The Grove, and none of them mentions SEO.
// --------------------------------------------------------------------------

const SELLING_TO_THE_VENUE = {
  "preferred-vendor photographer":
    "Hi! I'm a wedding photographer in the Atlanta area and I'd love to be added to your preferred vendor list. I shoot about 30 weddings a year and would love to partner with your venue.",
  "DJ and lighting company":
    "We are a DJ and lighting company serving west Georgia. We would love to work with your venue and offer your couples a discount. Can we send over our packages?",
  "florist partnership":
    "Hello, I own a floral studio in Carrollton. I'd like to discuss becoming one of your recommended florists. We can provide ceremony arrangements for your brides.",
  "directory listing sale":
    "We run a wedding venue directory with over 40,000 monthly visitors. A featured listing would put The Grove in front of couples searching in Georgia. Shall I send the premium listing details?",
  "commission booking platform":
    "Our platform sends qualified couples straight to venues like yours — you only pay a commission per booking. No upfront cost. Interested?",
  "venue booking software demo":
    "I'm reaching out because we built booking and CRM software for wedding venues. It handles tours, contracts and payments. Could I show you a quick demo?",
  "influencer styled shoot":
    "Hi! I'm a content creator with 85k followers in the wedding space. I'd love to do a styled shoot at your property in exchange for exposure and tagged posts.",
  "planner wanting referrals":
    "I'm a wedding planner and I'd love to build a referral relationship with your venue. I send my clients to venues I trust and would love to add you to my list.",
  "caterer wanting on the list":
    "We are a full service catering company and would like to be on your approved caterer list. We can provide tastings for your couples at no charge.",
  "photo booth revenue share":
    "Let us provide photo booths for events at your venue. We offer a revenue share for every booking we take at your property.",
  "bartending service":
    "Our licensed and insured bartending service would love to be your go-to bar staff. We can staff every event at your venue.",
  "staffing agency":
    "Our agency supplies event staff — servers, setup crews, parking attendants. We would love to provide staffing for your weddings.",
  "rental supplier":
    "We rent tables, chairs, linens and dance floors to venues across Georgia. We'd love to supply your events and offer your clients our full catalog.",
  // The farm gets the solicitations any rural property gets.
  "driveway paving":
    "We noticed your gravel drive. Our company repaves and seals driveways and parking areas. We can give your property a free estimate this week.",
  "tree service":
    "Our crew does tree removal and trimming. Your property looks like it could use some clearing. Let us take a look at the trees on your land.",
  "commercial solar":
    "We install commercial solar. Your barn roof is a great candidate and there are tax credits available. Can we schedule an assessment of your property?",
  "venue liability insurance":
    "We specialize in event venue liability insurance. We can review your current policy and likely reduce what your venue pays. Who handles that for you?",
  "card processing":
    "We can lower the card processing rates your venue pays on deposits. Most venues like yours save 30%. Send us a statement and we will show you.",
  "gatekeeper hunt":
    "Hope this finds you well! Quick question — who at The Grove handles marketing? I have an idea I think could help you get more bookings this year.",
  // Already caught before this change; kept so a rewrite cannot lose it.
  "SEO pitch":
    "I reviewed your website and it is not ranking on the first page of google. Our SEO team can build backlinks and get your venue more website traffic.",
};

for (const [label, message] of Object.entries(SELLING_TO_THE_VENUE)) {
  test(`held back: ${label}`, () => {
    const result = screen(sol(message), ok);
    assert.equal(result.verdict, "spam", `${label} reached the venue — reasons: ${result.reasons.join("; ") || "none"}`);
  });
}

// --------------------------------------------------------------------------
// Delivered. Christy must see all of these. "clean" or "suspect" both reach
// her — "suspect" only adds "[Check]" to the subject line.
// --------------------------------------------------------------------------

const REAL_INQUIRIES = {
  "normal wedding inquiry": real("We're getting married next fall and would love to tour the venue."),
  // A real lead can be one line. Brevity is not a signal.
  "one line": real("Interested in an October 2027 wedding. Is that date open?"),
  "two words": real("Availability please"),
  "unfamiliar names": real("We would like to see the barn and talk about a ceremony outside.", {
    name: "Oluwaseun Adebayo-Okafor",
    brideName: "Oluwaseun Adebayo-Okafor",
    groomName: "Chidinma Nwachukwu",
  }),
  // A couple writes about vendors constantly. Same nouns as a vendor pitch.
  "mentions their own photographer": real("Our photographer asked if she can come early to scout the property. Also we'd love a tour this month."),
  "mentions their planner": real("Our wedding planner recommended The Grove to us. We'd like to check availability for next June."),
  "asks about using outside vendors": real("Do we have to use your vendors or can we bring our own caterer and DJ?"),
  // This one was held back by the deployed filter: "venues like yours".
  "quotes a pitch made to them": real("A vendor emailed us saying they could get us a discount on venues like yours. We'd rather just book directly with you — can we tour?"),
  // Corporate inquiries describe the sender's own business. That is not a pitch.
  "corporate, own business named": real(
    "I'm the office manager at Hollis Insurance Group here in Villa Rica. We want to host our company holiday party for about 60 people.",
    { brideName: "", groomName: "", companyName: "Hollis Insurance Group" }
  ),
  "corporate, sender works in marketing": real(
    "I handle marketing for a local dental practice and we are looking for a venue for our staff appreciation dinner in March.",
    { brideName: "", groomName: "", companyName: "Smile Bright Dental" }
  ),
  // A photographer renting the property is revenue, not a solicitation.
  "photographer booking a paid session": real("I'd like to book the property for a paid engagement photo session for my clients. What is your hourly rate for photographers?"),
  // A vendor can be a customer too.
  "florist about her own wedding": real("I'm a florist but I'm writing about my OWN wedding — my fiance and I want to get married at The Grove next spring."),
  "mother of the bride, all caps": real("HI MY DAUGHTER IS GETTING MARRIED, CALL ME 770 555 0134 THANK YOU SO MUCH"),
  "rehearsal dinner question": real("Do you allow a rehearsal dinner on site the night before? We are looking at the first weekend in May."),
  "long story": real(
    "My fiance proposed at the lake last month and we have been looking all over west Georgia. We saw your photos on Instagram and fell in love with the barn. We are hoping for about 120 guests, probably a Saturday in late September 2027. Could we come walk the property?"
  ),
};

for (const [label, inquiry] of Object.entries(REAL_INQUIRIES)) {
  test(`delivered: ${label}`, () => {
    const result = screen(inquiry, ok);
    assert.notEqual(result.verdict, "spam", `${label} was held back — reasons: ${result.reasons.join("; ") || "none"}`);
  });
}

// --------------------------------------------------------------------------
// The safety catch itself.
// --------------------------------------------------------------------------

test("wanting an event here outranks every pitch rule", () => {
  // Same sentence, with and without a customer's intent attached.
  const pitch = "We'd love to be added to your preferred vendor list and provide flowers for your brides.";
  assert.equal(screenVenuePitch(pitch).verdict, "pitch");
  assert.equal(screenVenuePitch(`${pitch} Also, we are getting married here ourselves next June.`).verdict, "clean");
});

test("a couple repeating a pitch is delivered, tagged, never held back", () => {
  const result = screen(real("A marketing company told us they get discounts at venues like yours. We'd rather book directly — is June 2027 open?"), ok);
  assert.equal(result.verdict, "suspect");
  assert.ok(result.reasons.some((r) => r.includes("they want an event here")), result.reasons.join("; "));
});

test("saying what you are is not an offer", () => {
  // Identity alone must never decide: a florist, a photographer and a planner
  // all get married.
  for (const line of ["I am a wedding photographer.", "We are a floral studio.", "I own a catering company."]) {
    assert.equal(screenVenuePitch(line).verdict, "clean", line);
  }
});

test("asking the venue a question is not an offer", () => {
  assert.equal(screenVenuePitch("Can your caterer provide linens and can your staff set up chairs?").verdict, "check");
  assert.notEqual(screenVenuePitch("Can your caterer provide linens and can your staff set up chairs?").verdict, "pitch");
});

test("a pitch wearing a couple's sentence is delivered, but tagged", () => {
  // The safety catch is cheap to defeat on purpose. It must not be silent.
  const cloaked = screen(sol("We are getting married next June. Also I'd love to be added to your preferred vendor list."), ok);
  assert.equal(cloaked.verdict, "clean");
  assert.deepEqual(cloaked.notes, ["asks for an event here, but also reads like a vendor's offer"]);
  // A plain couple gets no banner at all.
  assert.deepEqual(screen(real("We are getting married next June, can we tour?"), ok).notes, []);
});

test("notes never change the verdict or the score", () => {
  const cloaked = screen(sol("Availability please. We can provide photo booths for your couples at your venue."), ok);
  assert.equal(cloaked.score, 0);
  assert.equal(cloaked.verdict, "clean");
  assert.equal(cloaked.notes.length, 1);
});

test("a venue target alone is only ever a check, and a check is not scored", () => {
  assert.equal(screenVenuePitch("Your venue looks lovely.").verdict, "check");
  // Unscored on purpose: a new weak signal that could add to an existing one
  // and cross the score >= 2 line would start holding real couples back.
  assert.equal(screen(real("Your venue looks lovely."), ok).score, 0);
});

test("wantsTheirOwnEvent recognises the short real ones", () => {
  for (const line of ["Availability please", "Is that date available?", "We want to book the venue", "our wedding", "How many guests can you hold?"]) {
    assert.ok(wantsTheirOwnEvent(line), line);
  }
  assert.equal(wantsTheirOwnEvent("We provide photo booths for your couples."), false);
});

// --------------------------------------------------------------------------
// A held-back submission must never be thanked and then lost. The Blob write
// is its only copy — it is not emailed, not pushed to GHL, not texted.
// --------------------------------------------------------------------------

test("a held-back submission is only acknowledged if it was actually kept", () => {
  assert.equal(mayAcknowledgeHeldBack({ kept: true, blobConfigured: true, production: true }), true);
  // Store attached, write failed, on production: this is a lost lead. Say so.
  assert.equal(mayAcknowledgeHeldBack({ kept: false, blobConfigured: true, production: true }), false);
  // No store attached at all, on production: still a lost lead.
  assert.equal(mayAcknowledgeHeldBack({ kept: false, blobConfigured: false, production: true }), false);
  // Local development with no store: the developer gets the normal path.
  assert.equal(mayAcknowledgeHeldBack({ kept: false, blobConfigured: false, production: false }), true);
  // A store IS attached off production and its write failed — not graceful.
  assert.equal(mayAcknowledgeHeldBack({ kept: false, blobConfigured: true, production: false }), false);
});
