import test from "node:test";
import assert from "node:assert/strict";
import { createSession, validSession, validAccessCode } from "../lib/leads-session.ts";
import { notifyChristy } from "../lib/lead-sms.ts";
import { fetchLeads } from "../lib/grove-leads.ts";

test("sessions reject tampering, expiry, secret rotation and missing configuration", () => {
  process.env.LEADS_ACCESS_CODE = "a".repeat(64);
  process.env.LEADS_SESSION_SECRET = "b".repeat(64);
  const now = 1789560000000;
  const token = createSession(now);
  assert.equal(validSession(token, now), true);
  assert.equal(validAccessCode("a".repeat(64)), true);
  assert.equal(validAccessCode("wrong"), false);
  assert.equal(validSession(token + "x", now), false);
  assert.equal(validSession(token + ".extra", now), false);
  assert.equal(validSession(token, now + 8 * 3600000), false);
  process.env.LEADS_ACCESS_CODE = "c".repeat(64);
  assert.equal(validSession(token, now), false);
  delete process.env.LEADS_SESSION_SECRET;
  assert.equal(validSession(token, now), false);
});

test("SMS is off by default, disabled on previews, uses fixed recipient, and handles failures", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    calls++;
    assert.equal(options.body.get("To"), "+15555550123");
    assert.match(options.body.get("Body"), /thegroveatdefoorfarm.com\/leads/);
    return new Response("{}", { status: 201 });
  });
  delete process.env.LEAD_SMS_ENABLED;
  assert.equal((await notifyChristy()).reason, "disabled");
  process.env.LEAD_SMS_ENABLED = "true";
  process.env.VERCEL_ENV = "preview";
  assert.equal((await notifyChristy()).reason, "disabled");
  process.env.VERCEL_ENV = "production";
  assert.equal((await notifyChristy()).reason, "not_configured");
  assert.equal(calls, 0);
  Object.assign(process.env, {
    TWILIO_ACCOUNT_SID: "AC" + "0".repeat(32), TWILIO_API_KEY_SID: "SK" + "0".repeat(32), TWILIO_API_KEY_SECRET: "test-only",
    TWILIO_FROM_NUMBER: "+15555550124", LEAD_SMS_TO: "+15555550123",
  });
  assert.equal((await notifyChristy()).ok, true);
  assert.equal(calls, 1);
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    assert.match(options.body.get("Body"), /inquiry arrived by email/);
    return new Response("{}", { status: 400 });
  });
  assert.equal((await notifyChristy(false)).reason, "rejected");
  t.mock.method(globalThis, "fetch", async () => { throw new Error("timeout"); });
  assert.equal((await notifyChristy()).reason, "request_failed");
});

test("dashboard scopes requests and excludes unrelated pipeline or non-website records", async (t) => {
  Object.assign(process.env, { GHL_API_TOKEN: "test-only", GHL_LOCATION_ID: "grove", GHL_PIPELINE_ID: "pipeline" });
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(options.cache, "no-store");
    const query = new URL(url);
    assert.equal(query.searchParams.get(query.pathname.endsWith("pipelines") ? "locationId" : "location_id"), "grove");
    if (query.pathname.endsWith("pipelines")) return Response.json({ pipelines: [{ id: "pipeline", stages: [{ id: "new", name: "New Lead" }] }] });
    assert.equal(query.searchParams.get("pipeline_id"), "pipeline");
    assert.equal(query.searchParams.get("page"), "2");
    return Response.json({ opportunities: [
      { id: "one", pipelineId: "pipeline", pipelineStageId: "new", source: "The Grove Website · Google", name: "Test Guest — Wedding", contact: { name: "Test Guest", email: "test@example.com", phone: "+15555550123" } },
      { id: "two", pipelineId: "different", source: "The Grove Website" },
      { id: "three", pipelineId: "pipeline", source: "Manual import" },
    ] });
  });
  const result = await fetchLeads(2);
  assert.equal(result.leads.length, 1);
  assert.equal(result.leads[0].stage, "New Lead");
  assert.equal(result.leads[0].source, "Google");
  assert.equal(result.page, 2);
  assert.equal(result.hasMore, false);
  t.mock.method(globalThis, "fetch", async () => new Response("{}", { status: 401 }));
  await assert.rejects(fetchLeads(1), /unavailable/);
});

test("trash mutations verify the exact website lead and never delete a contact", async (t) => {
  const { moveLead, LeadNotFoundError } = await import("../lib/grove-leads.ts");
  Object.assign(process.env, { GHL_API_TOKEN: "test-only", GHL_LOCATION_ID: "grove", GHL_PIPELINE_ID: "pipeline" });
  let opportunity = { id: "lead-one", locationId: "grove", pipelineId: "pipeline", source: "The Grove Website · Google", status: "open" };
  const writes = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (options.method === "PUT") {
      assert.equal(url, "https://services.leadconnectorhq.com/opportunities/lead-one/status");
      writes.push(JSON.parse(options.body).status);
      return Response.json({ succeded: true });
    }
    return Response.json({ opportunity });
  });
  await moveLead("lead-one", "trash");
  assert.deepEqual(writes, ["abandoned"]);
  opportunity = { ...opportunity, status: "abandoned" };
  await moveLead("lead-one", "restore");
  assert.deepEqual(writes, ["abandoned", "open"]);
  for (const invalid of [{ locationId: "other" }, { pipelineId: "other" }, { source: "Manual entry" }, { id: "different" }]) {
    const saved = opportunity;
    opportunity = { ...saved, ...invalid };
    await assert.rejects(moveLead("lead-one", "trash"), LeadNotFoundError);
    opportunity = saved;
  }
  assert.equal(writes.length, 2);
  t.mock.method(globalThis, "fetch", async (_url, options) => options.method === "PUT" ? Response.json({ success: false }) : Response.json({ opportunity }));
  await assert.rejects(moveLead("lead-one", "restore"), /Unable to update/);
});
