/* ============================================================
   POST /api/inquiry
   Handles a contact-form submission from The Grove website.
   Two independent, best-effort side effects (one failing never
   blocks the other):
     1) Emails the venue a formatted inquiry via Resend.
     2) Creates a Contact + Opportunity in GoHighLevel (GHL).

   Env vars (set in the Vercel project — never committed):
     RESEND_API_KEY        Resend API key (email side)
     INQUIRY_FROM_EMAIL    Verified sender, e.g.
                           "The Grove Website <inquiries@creativecowboys.co>"
     INQUIRY_NOTIFY_EMAIL  Venue inbox to notify
                           (default: info@thegroveatdefoorfarm.com)
     GHL_API_TOKEN         GHL Private Integration token (opportunity side)
     GHL_LOCATION_ID       GHL sub-account (location) id
     GHL_PIPELINE_ID       Pipeline the opportunity lands in
     GHL_STAGE_NAME        Optional — stage to drop the lead into
                           (default: "New Lead"; falls back to first stage)
   ============================================================ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOTIFY_DEFAULT = "info@thegroveatdefoorfarm.com";
const FROM_DEFAULT = "The Grove Website <inquiries@creativecowboys.co>";
const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

const EVENT_LABELS: Record<string, string> = {
  wedding: "Wedding Ceremony & Reception",
  corporate: "Corporate Event",
  graduation: "Graduation Party",
  social: "Social Celebration / Reunion",
  photoshoot: "Photo Shoot",
  other: "Other Event Type",
};

const HEARD_LABELS: Record<string, string> = {
  social: "Instagram / Facebook",
  search: "Google Search",
  referral: "Friend / Family Referral",
  vendor: "Wedding Vendor Recommendation",
  zola: "Zola",
  other: "Other",
};

type Inquiry = {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  guestCount: string;
  preferredDate: string;
  heardAbout: string;
  message: string;
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* Resolve the target stage id from the pipeline (by name, default first). */
async function resolveStageId(
  headers: Record<string, string>,
  locationId: string,
  pipelineId: string
): Promise<string | null> {
  const wanted = (process.env.GHL_STAGE_NAME || "New Lead").trim().toLowerCase();
  try {
    const r = await fetch(
      `${GHL_BASE}/opportunities/pipelines?locationId=${encodeURIComponent(locationId)}`,
      { headers }
    );
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error("GHL pipelines fetch failed:", r.status, JSON.stringify(j));
      return null;
    }
    const pipeline = (j?.pipelines || []).find(
      (p: { id: string }) => p.id === pipelineId
    );
    const stages: { id: string; name: string }[] = pipeline?.stages || [];
    if (!stages.length) return null;
    const match = stages.find((s) => (s.name || "").trim().toLowerCase() === wanted);
    return (match || stages[0]).id;
  } catch (e) {
    console.error("GHL pipelines fetch error:", e);
    return null;
  }
}

/* --- GHL: upsert the contact, then open an opportunity for it --- */
async function pushToGHL(d: Inquiry, eventLabel: string, heardLabel: string) {
  const token = process.env.GHL_API_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  const pipelineId = process.env.GHL_PIPELINE_ID;

  if (!token || !locationId || !pipelineId) {
    // Diagnostic: report presence/shape only — never the secret values.
    console.warn(
      "GHL not configured — skipping opportunity creation.",
      JSON.stringify({
        tokenPresent: !!token,
        tokenLength: token ? token.length : 0,
        tokenPrefix: token ? token.slice(0, 4) : null,
        locationIdPresent: !!locationId,
        pipelineIdPresent: !!pipelineId,
        ghlKeysSeen: Object.keys(process.env).filter((k) => k.startsWith("GHL_")),
      })
    );
    return { ok: false, reason: "not_configured" };
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Version: GHL_VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const pipelineStageId = await resolveStageId(headers, locationId, pipelineId);
  if (!pipelineStageId) {
    console.error("GHL could not resolve a pipeline stage id.");
    return { ok: false, reason: "no_stage_id" };
  }

  const [firstName, ...rest] = d.name.trim().split(/\s+/);
  const lastName = rest.join(" ");

  // 1) Upsert contact (dedupes on email/phone within the location).
  let contactId = "";
  try {
    const cr = await fetch(`${GHL_BASE}/contacts/upsert`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        locationId,
        firstName: firstName || d.name,
        lastName,
        name: d.name,
        email: d.email,
        phone: d.phone,
        source: "The Grove Website",
      }),
    });
    const cj = await cr.json().catch(() => ({}));
    if (!cr.ok) {
      console.error("GHL contact upsert failed:", cr.status, JSON.stringify(cj));
      return { ok: false, reason: "contact_failed" };
    }
    contactId = cj?.contact?.id || cj?.id || "";
  } catch (e) {
    console.error("GHL contact upsert error:", e);
    return { ok: false, reason: "contact_error" };
  }

  if (!contactId) {
    console.error("GHL upsert returned no contact id.");
    return { ok: false, reason: "no_contact_id" };
  }

  // 2) Create the opportunity.
  try {
    const details = [
      `Event: ${eventLabel}`,
      d.preferredDate ? `Preferred date: ${d.preferredDate}` : "",
      d.guestCount ? `Guest count: ${d.guestCount}` : "",
      `Heard about us: ${heardLabel}`,
      d.message ? `Message: ${d.message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const or = await fetch(`${GHL_BASE}/opportunities/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        pipelineId,
        pipelineStageId,
        locationId,
        contactId,
        name: `${d.name} — ${eventLabel}`,
        status: "open",
        source: "The Grove Website",
        notes: details,
      }),
    });
    const oj = await or.json().catch(() => ({}));
    if (!or.ok) {
      console.error("GHL opportunity create failed:", or.status, JSON.stringify(oj));
      return {
        ok: false,
        reason: "opportunity_failed",
        detail: `${or.status}: ${JSON.stringify(oj).slice(0, 300)}`,
      };
    }
  } catch (e) {
    console.error("GHL opportunity create error:", e);
    return { ok: false, reason: "opportunity_error" };
  }

  return { ok: true };
}

/* --- Resend: email the venue a formatted inquiry --- */
async function emailVenue(d: Inquiry, eventLabel: string, heardLabel: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY not set — skipping venue email.");
    return { ok: false, reason: "not_configured" };
  }

  const from = process.env.INQUIRY_FROM_EMAIL || FROM_DEFAULT;
  const to = process.env.INQUIRY_NOTIFY_EMAIL || NOTIFY_DEFAULT;

  const row = (label: string, value: string) =>
    value
      ? `<tr><td style="padding:6px 16px 6px 0;color:#8a7f6f;font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:6px 0;color:#1a1814;font-size:14px;">${esc(value)}</td></tr>`
      : "";

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:8px;color:#1a1814;">
    <div style="border-top:3px solid #C8A97E;background:#faf9f7;border-radius:10px;padding:28px;">
      <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#C8A97E;font-weight:700;margin:0 0 8px;">New Website Inquiry</p>
      <h1 style="font-family:Georgia,serif;font-size:22px;line-height:1.2;margin:0 0 4px;color:#1a1814;">${esc(d.name)}</h1>
      <p style="font-size:14px;color:#6b6355;margin:0 0 20px;">${eventLabel}</p>
      <table style="width:100%;border-collapse:collapse;">
        ${row("Email", d.email)}
        ${row("Phone", d.phone)}
        ${row("Preferred date", d.preferredDate)}
        ${row("Guest count", d.guestCount)}
        ${row("Heard about us", heardLabel)}
      </table>
      ${
        d.message
          ? `<div style="margin-top:18px;padding-top:16px;border-top:1px solid #e8e4dc;"><p style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#8a7f6f;margin:0 0 6px;">Message</p><p style="font-size:14px;line-height:1.6;color:#1a1814;margin:0;white-space:pre-wrap;">${esc(d.message)}</p></div>`
          : ""
      }
      <hr style="border:none;border-top:1px solid #e8e4dc;margin:24px 0 14px;">
      <p style="font-size:12px;color:#9c9484;margin:0;">Sent from thegrove.creativecowboys.co — reply directly to reach ${esc(d.name)}.</p>
    </div>
  </div>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: d.email,
        subject: `New inquiry: ${d.name} — ${eventLabel}`,
        html,
      }),
    });
    if (!r.ok) {
      console.error("Resend send failed:", r.status, await r.text());
      return { ok: false, reason: "send_failed" };
    }
  } catch (e) {
    console.error("Resend send error:", e);
    return { ok: false, reason: "send_error" };
  }

  return { ok: true };
}

export async function POST(request: Request) {
  let body: Partial<Inquiry> = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const d: Inquiry = {
    name: (body.name || "").trim(),
    email: (body.email || "").trim().toLowerCase(),
    phone: (body.phone || "").trim(),
    eventType: (body.eventType || "").trim(),
    guestCount: (body.guestCount || "").toString().trim(),
    preferredDate: (body.preferredDate || "").trim(),
    heardAbout: (body.heardAbout || "").trim(),
    message: (body.message || "").trim(),
  };

  if (!d.name || !EMAIL_RE.test(d.email) || !d.phone) {
    return Response.json(
      { error: "Please provide your name, a valid email, and a phone number." },
      { status: 400 }
    );
  }

  const eventLabel = EVENT_LABELS[d.eventType] || d.eventType || "Event Inquiry";
  const heardLabel = HEARD_LABELS[d.heardAbout] || d.heardAbout || "—";

  const [email, ghl] = await Promise.all([
    emailVenue(d, eventLabel, heardLabel),
    pushToGHL(d, eventLabel, heardLabel),
  ]);

  // Succeed for the visitor as long as at least one channel accepted the lead.
  if (!email.ok && !ghl.ok) {
    return Response.json(
      { error: "We couldn't submit your inquiry. Please call us or try again." },
      { status: 502 }
    );
  }

  return Response.json({
    ok: true,
    email: email.ok,
    ghl: ghl.ok,
    // Temporary diagnostic — remove once GHL is confirmed working.
    ghlReason: ghl.ok ? null : ghl.reason,
    ghlDetail: ghl.ok ? null : (ghl as { detail?: string }).detail || null,
  });
}
