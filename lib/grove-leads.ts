export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  source: string;
  stage: string;
  status: string;
  createdAt: string;
};

export type LeadsPage = { leads: Lead[]; page: number; hasMore: boolean; view: "active" | "trash" };

type Opportunity = {
  id?: string;
  name?: string;
  source?: string;
  pipelineId?: string;
  pipelineStageId?: string;
  status?: string;
  createdAt?: string;
  contact?: { name?: string; email?: string; phone?: string };
};

export async function fetchLeads(page: number, view: "active" | "trash" = "active"): Promise<LeadsPage> {
  const token = process.env.GHL_API_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  const pipelineId = process.env.GHL_PIPELINE_ID;
  if (!token || !locationId || !pipelineId) throw new Error("Leads connection is not configured");
  const headers = { Authorization: `Bearer ${token}`, Version: "2021-07-28", Accept: "application/json" };
  const base = "https://services.leadconnectorhq.com";
  // The 2021-07-28 search endpoint takes snake_case query params (location_id, pipeline_id);
  // its responses are camelCase.
  const query = new URLSearchParams({ location_id: locationId, pipeline_id: pipelineId, status: view === "trash" ? "abandoned" : "all", order: "added_desc", page: String(page), limit: "30" });
  const [response, pipelinesResponse] = await Promise.all([
    fetch(`${base}/opportunities/search?${query}`, { headers, cache: "no-store", signal: AbortSignal.timeout(12000) }),
    fetch(`${base}/opportunities/pipelines?locationId=${encodeURIComponent(locationId)}`, { headers, cache: "no-store", signal: AbortSignal.timeout(12000) }),
  ]);
  if (!response.ok || !pipelinesResponse.ok) throw new Error("Leads provider is unavailable");
  const data = await response.json();
  const pipelines = await pipelinesResponse.json();
  if (!Array.isArray(data.opportunities) || !Array.isArray(pipelines.pipelines)) throw new Error("Unexpected leads response");
  const pipeline = pipelines.pipelines.find((p: { id: string }) => p.id === pipelineId);
  if (!pipeline) throw new Error("Leads pipeline is unavailable");
  const stages = new Map<string, string>((pipeline.stages || []).map((s: { id: string; name: string }) => [s.id, s.name]));
  const opportunities: Opportunity[] = data.opportunities;
  const leads = opportunities
    .filter((o) => o.id && o.pipelineId === pipelineId && o.source?.startsWith("The Grove Website"))
    .filter((o) => view === "trash" ? o.status === "abandoned" : o.status !== "abandoned")
    .map((o) => ({
      id: o.id!, name: o.contact?.name || o.name?.split(" — ")[0] || "Website inquiry",
      email: o.contact?.email || "", phone: o.contact?.phone || "",
      title: o.name || "Website inquiry", source: o.source?.replace(/^The Grove Website\s*·?\s*/, "") || "Website",
      stage: stages.get(o.pipelineStageId || "") || "Unassigned", status: o.status || "open", createdAt: o.createdAt || "",
    }));
  // Pagination is based on provider records, including non-website records filtered above.
  return { leads, page, view, hasMore: opportunities.length === 30 };
}

export class LeadNotFoundError extends Error {}

export async function moveLead(id: string, action: "trash" | "restore") {
  const token = process.env.GHL_API_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  const pipelineId = process.env.GHL_PIPELINE_ID;
  if (!token || !locationId || !pipelineId) throw new Error("Leads connection is not configured");
  const headers = { Authorization: `Bearer ${token}`, Version: "2021-07-28", Accept: "application/json", "Content-Type": "application/json" };
  const url = `https://services.leadconnectorhq.com/opportunities/${encodeURIComponent(id)}`;
  const response = await fetch(url, { headers, cache: "no-store", signal: AbortSignal.timeout(12000) });
  if (response.status === 404) throw new LeadNotFoundError();
  if (!response.ok) throw new Error("Unable to verify lead");
  const { opportunity } = await response.json();
  // Never trust a client-supplied ID to authorize access to another client's record.
  if (!opportunity || opportunity.id !== id || opportunity.locationId !== locationId ||
      opportunity.pipelineId !== pipelineId || !opportunity.source?.startsWith("The Grove Website")) {
    throw new LeadNotFoundError();
  }
  const status = action === "trash" ? "abandoned" : "open";
  if (opportunity.status === status) return;
  if (action === "restore" && opportunity.status !== "abandoned") throw new LeadNotFoundError();
  const changed = await fetch(`${url}/status`, {
    method: "PUT", headers, body: JSON.stringify({ status }), signal: AbortSignal.timeout(12000),
  });
  // GHL answers the status update with { succeded: true } (their spelling); accept either form.
  const result = changed.ok ? await changed.json().catch(() => ({})) : {};
  if (!changed.ok || (result.succeded !== true && result.success !== true)) throw new Error("Unable to update lead");
}
