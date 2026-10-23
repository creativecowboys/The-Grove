// Durable log of every inquiry-form submission, written to the private Vercel
// Blob store before email/GHL are attempted, so a lead survives a Resend or
// GHL outage and a spam false positive can be found and recovered.
// Best-effort: callers must not let a logging failure block the pipeline.
//
//   leads/<date>/...json  real and "suspect" submissions (these are delivered)
//   spam/<date>/...json   everything the spam screen held back, never delivered.
//                         Vercel → the-grove-at-defoor-farm → Storage → the-grove-leads.
//
// Needs a Blob store attached to the Vercel project (BLOB_READ_WRITE_TOKEN).

import { put } from "@vercel/blob";

export async function logLead(payload: Record<string, unknown>, kind: "lead" | "spam" = "lead") {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn("BLOB_READ_WRITE_TOKEN not set; submission not written to the internal log.");
    return null;
  }
  const ts = new Date().toISOString();
  const folder = kind === "spam" ? "spam" : "leads";
  const { url } = await put(
    `${folder}/${ts.slice(0, 10)}/${ts.replace(/[:.]/g, "-")}.json`,
    JSON.stringify({ receivedAt: ts, ...payload }, null, 2),
    { access: "private", addRandomSuffix: true, contentType: "application/json" }
  );
  return url;
}
