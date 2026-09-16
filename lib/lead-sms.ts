type SmsResult = { ok: boolean; reason?: string };

export async function notifyChristy(cardCreated = true): Promise<SmsResult> {
  // Explicit opt-in: previews and incomplete configurations cannot text anyone.
  if (process.env.LEAD_SMS_ENABLED !== "true" || process.env.VERCEL_ENV === "preview") return { ok: false, reason: "disabled" };
  const account = process.env.TWILIO_ACCOUNT_SID || "";
  const key = process.env.TWILIO_API_KEY_SID || "";
  const secret = process.env.TWILIO_API_KEY_SECRET || "";
  const to = process.env.LEAD_SMS_TO || "";
  const service = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const from = process.env.TWILIO_FROM_NUMBER || "";
  if (!/^AC[0-9a-f]{32}$/i.test(account) || !/^SK[0-9a-f]{32}$/i.test(key) || !secret || !/^\+[1-9]\d{7,14}$/.test(to) ||
      !(service ? /^MG[0-9a-f]{32}$/i.test(service) : /^\+[1-9]\d{7,14}$/.test(from))) {
    console.error("Lead SMS configuration is incomplete");
    return { ok: false, reason: "not_configured" };
  }
  // No visitor-controlled text, phone number, or URL enters the notification.
  const message = cardCreated
    ? "There's a new lead for The Grove! View the details: https://thegroveatdefoorfarm.com/leads"
    : "The Grove: a new website inquiry arrived by email, but its lead card could not be saved. Please check the venue inbox.";
  const body = new URLSearchParams({ To: to, Body: message });
  body.set(service ? "MessagingServiceSid" : "From", service || from);
  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${account}/Messages.json`, {
      method: "POST", headers: {
        Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      }, body, signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      console.error("Lead SMS was not accepted", { status: response.status });
      return { ok: false, reason: "rejected" };
    }
    // Acceptance is not delivery. Do not retry an ambiguous timeout and risk duplicate texts.
    return { ok: true };
  } catch {
    console.error("Lead SMS request failed or timed out");
    return { ok: false, reason: "request_failed" };
  }
}
