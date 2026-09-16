"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, Phone, RefreshCw, ArrowUpRight, Inbox, Trash2, RotateCcw } from "lucide-react";
import type { LeadsPage } from "@/lib/grove-leads";
import styles from "./leads.module.css";

export default function LeadsBoard() {
  const [view, setView] = useState<"active" | "trash">("active");
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmId, setConfirmId] = useState("");
  const mutationRunning = useRef(false);
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<LeadsPage | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/leads?page=${page}&view=${view}`, { cache: "no-store", signal: controller.signal });
        if (response.status === 401) { window.location.reload(); return; }
        if (!response.ok) throw new Error("We couldn't refresh your leads. Please try again.");
        const data: LeadsPage = await response.json();
        if (mutationRunning.current || controller.signal.aborted) return;
        setResult(data);
        setUpdated(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
      } catch (e) {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Unable to load leads.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [page, revision, view]);
  useEffect(() => {
    const timer = setInterval(() => { if (document.visibilityState === "visible" && !mutationRunning.current) setRevision((r) => r + 1); }, 60000);
    return () => clearInterval(timer);
  }, []);
  async function changeLead(id: string, action: "trash" | "restore") {
    if (mutationRunning.current) return;
    mutationRunning.current = true;
    setBusyId(id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
      if (response.status === 401) { window.location.reload(); return; }
      if (!response.ok) throw new Error("We couldn't update this lead. Please refresh and try again.");
      setResult((previous) => previous ? { ...previous, leads: previous.leads.filter((lead) => lead.id !== id) } : previous);
      setConfirmId("");
      setNotice(action === "trash" ? "Lead moved to Trash. You can restore it there." : "Lead restored and reopened.");
      setRevision((r) => r + 1);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to update lead."); }
    finally { mutationRunning.current = false; setBusyId(""); }
  }
  const visible = result?.page === page && result?.view === view ? result.leads : [];
  return <div className={styles.content}>
    <header className={styles.heading}><div><p className={styles.eyebrow}>The beginning of something wonderful</p><h1>Your leads</h1><p>New conversations. Beautiful possibilities.</p></div>
      <button className={styles.refreshButton} onClick={() => setRevision((r) => r + 1)} disabled={loading || !!busyId}><RefreshCw size={16} />{loading ? "Refreshing…" : "Refresh"}</button>
    </header>
    <nav className={styles.views} aria-label="Lead views">
      <button aria-pressed={view === "active"} disabled={!!busyId} onClick={() => { setView("active"); setPage(1); setConfirmId(""); }}>Leads</button>
      <button aria-pressed={view === "trash"} disabled={!!busyId} onClick={() => { setView("trash"); setPage(1); setConfirmId(""); }}><Trash2 size={16} />Trash</button>
    </nav>
    {notice && <p className={styles.notice} role="status">{notice}</p>}
    <div className={styles.listHeading}><h2>{view === "trash" ? "Deleted leads" : "Website inquiries"} <span>{visible.length} on this page</span></h2><p>{updated ? `Updated ${updated} · refreshes every minute` : "Loading your inquiries…"}</p></div>
    {error && <div role="alert" className={styles.error}>{error}{result && " Previously loaded leads are shown below."}</div>}
    <div aria-busy={loading} className={styles.grid}>
      {visible.map((lead) => <article key={lead.id} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badge}>{lead.status === "open" ? lead.stage : lead.status}</span><time dateTime={lead.createdAt || undefined}>{lead.createdAt && !Number.isNaN(Date.parse(lead.createdAt)) ? new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</time></div>
        <h3>{lead.name}</h3><p className={styles.event}>{lead.title.startsWith(`${lead.name} — `) ? lead.title.slice(lead.name.length + 3) : lead.title}</p>
        <div className={styles.contact}>
          {lead.email && <a href={`mailto:${encodeURIComponent(lead.email)}`}><Mail size={16} /><span>{lead.email}</span><ArrowUpRight size={14} /></a>}
          {lead.phone && <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}><Phone size={16} /><span>{lead.phone}</span><ArrowUpRight size={14} /></a>}
          {!lead.email && !lead.phone && <p>Contact details are available in your CRM.</p>}
        </div><footer>Source <strong>{lead.source}</strong></footer>
        <div className={styles.cardActions}>
          {view === "trash" ? <button disabled={!!busyId} onClick={() => void changeLead(lead.id, "restore")}><RotateCcw size={16} />{busyId === lead.id ? "Restoring…" : "Restore lead"}</button>
          : confirmId === lead.id ? <div className={styles.confirmDelete}>
              <p>Move {lead.name} to Trash? You can restore this lead later.</p>
              <div><button disabled={!!busyId} className={styles.deleteButton} onClick={() => void changeLead(lead.id, "trash")}>{busyId === lead.id ? "Deleting…" : "Move to Trash"}</button>
              <button disabled={!!busyId} onClick={() => setConfirmId("")}>Cancel</button></div>
            </div>
          : <button className={styles.deleteButton} disabled={!!busyId} aria-label={`Delete lead from ${lead.name}`} onClick={() => setConfirmId(lead.id)}><Trash2 size={16} />Delete</button>}
        </div>
      </article>)}
    </div>
    {!loading && !error && visible.length === 0 && <div className={styles.empty}><Inbox size={32} /><h2>{view === "trash" ? "No deleted leads on this page" : page === 1 ? "Room for your next celebration" : "No website inquiries on this page"}</h2><p>{view === "trash" ? "Junk leads you delete can be restored from here." : page === 1 ? "New website inquiries will appear here as they arrive." : "Use the next page to continue through older records."}</p></div>}
    {loading && !result && <p role="status" className={styles.empty}>Loading your leads…</p>}
    <nav className={styles.pagination} aria-label="Lead pages"><button disabled={page === 1 || loading || !!busyId} onClick={() => setPage((p) => p - 1)}>Previous</button><span>Page {page}</span><button disabled={loading || !!busyId || result?.page !== page || !result?.hasMore} onClick={() => setPage((p) => p + 1)}>Next</button></nav>
  </div>;
}
