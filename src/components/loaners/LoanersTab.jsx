// ─── Loaners Tab ──────────────────────────────────────────────────────────────
import React from "react";
import { Card, SH, Bdg, Btn, Dot } from "../ui";
import { LSTC, LSTS } from "../../constants/theme";

export default function LoanersTab({ loaners, setLoaners, setShowAddLoaner, setEditLoaner }) {
  return (
    <div style={{ padding: 16 }}>
      {loaners.length === 0 && (
        <Card style={{ textAlign: "center", padding: 32, marginBottom: 16 }}>
          <div style={{ color: "#444", fontSize: 13, marginBottom: 12 }}>No loaners tracked yet</div>
          <Btn color="#a060e0" onClick={() => setShowAddLoaner(true)}>+ Add First Loaner</Btn>
        </Card>
      )}

      {/* Active loaners */}
      {loaners.filter((l) => l.status !== "Returned").length > 0 && <>
        <SH color="#a060e0" label="Active Loaners" count={loaners.filter((l) => l.status !== "Returned").length} />
        {loaners.filter((l) => l.status !== "Returned").map((l) => {
          const sc = LSTC[l.status] || "#888";
          return (
            <div key={l.id} style={{ background: "#111119", border: "1px solid #1e1e2e", borderLeft: "3px solid " + sc, borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#ddd8cc" }}>{l.setName}</div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{l.hospital}</div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Bdg bg={sc + "22"} color={sc}>{l.status}</Bdg>
                  <button onClick={() => setEditLoaner(l)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>edit</button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
                {l.requestedDate && <div><div style={{ fontSize: 8, color: "#444", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 2 }}>Requested</div><div style={{ fontSize: 11, color: "#aaa" }}>{new Date(l.requestedDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div></div>}
                {l.neededDate    && <div><div style={{ fontSize: 8, color: "#444", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 2 }}>Needed By</div><div style={{ fontSize: 11, color: l.status === "Overdue" ? "#e05060" : "#aaa" }}>{new Date(l.neededDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div></div>}
                {l.returnDate    && <div><div style={{ fontSize: 8, color: "#444", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 2 }}>Return By</div><div style={{ fontSize: 11, color: "#aaa" }}>{new Date(l.returnDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div></div>}
                {l.assignee      && <div><div style={{ fontSize: 8, color: "#444", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 2 }}>Owner</div><div style={{ paddingTop: 2 }}><Dot id={l.assignee} size={18} /></div></div>}
              </div>
              {l.notes && <div style={{ fontSize: 11, color: "#444", marginTop: 4, paddingTop: 8, borderTop: "1px solid #161620" }}>{l.notes}</div>}
              {l.photo && <div style={{ marginTop: 8 }}><img src={l.photo} style={{ width: "100%", maxHeight: 120, objectFit: "cover", borderRadius: 8, border: "1px solid #2a2a3e" }} /></div>}
              {l.fedex && <a href={"https://www.fedex.com/fedextrack/?trknbr=" + l.fedex.replace(/\s/g, "")} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: "#e0a020", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, border: "1px solid #e0a02044", borderRadius: 5, padding: "2px 8px" }}>📦 Track {l.fedex}</a>}
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {LSTS.filter((s) => s !== l.status).map((s) => (
                  <button key={s} onClick={() => setLoaners((p) => p.map((x) => x.id === l.id ? { ...x, status: s } : x))} style={{ padding: "3px 10px", borderRadius: 20, border: "1px solid " + (LSTC[s] || "#444") + "55", background: "transparent", color: LSTC[s] || "#444", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>→ {s}</button>
                ))}
              </div>
            </div>
          );
        })}
      </>}

      {/* Returned loaners */}
      {loaners.filter((l) => l.status === "Returned").length > 0 && <>
        <SH color="#4a9eff" label="Returned" count={loaners.filter((l) => l.status === "Returned").length} />
        {loaners.filter((l) => l.status === "Returned").map((l) => (
          <div key={l.id} style={{ background: "#111119", border: "1px solid #1e1e2e", borderRadius: 12, padding: "12px 16px", marginBottom: 6, opacity: 0.75, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: "#ddd8cc" }}>{l.setName}</div>
              <div style={{ fontSize: 10, color: "#555" }}>{l.hospital}</div>
              {l.fedex && <a href={"https://www.fedex.com/fedextrack/?trknbr=" + l.fedex.replace(/\s/g, "")} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: "#e0a020", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4, border: "1px solid #e0a02044", borderRadius: 5, padding: "2px 6px" }}>📦 {l.fedex}</a>}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Bdg bg="#1a3d2b" color="#34a876">Returned</Bdg>
              <button onClick={() => setEditLoaner(l)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>edit</button>
              <button onClick={() => setLoaners((p) => p.filter((x) => x.id !== l.id))} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 13 }}>×</button>
            </div>
          </div>
        ))}
      </>}
    </div>
  );
}
