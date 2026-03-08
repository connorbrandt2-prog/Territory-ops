// ─── Case Detail Panel ────────────────────────────────────────────────────────
import React from "react";
import { Card, Lbl, Bdg, Inp, Btn, AcPick } from "../ui";
import { ST } from "../../constants/theme";
import { cSt } from "../../utils/caseUtils";

export default function CaseDetail({
  selCase, gs, upCase, toggleSet, togRet, assignSetAndTask, assignCoverageAndTask,
  addImp, remImp, newImplant, setNewImplant, confirmDeleteCase, setConfirmDeleteCase,
  setCases, setSelCaseId, u,
}) {
  if (!selCase) return <div style={{ color: "#333", display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 12 }}>Select a case</div>;

  const s  = gs(selCase.surgeonId);
  const st = ST[cSt(selCase)];
  const conf = Object.values(selCase.setChecks || {}).filter((x) => x.confirmed).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 8, color: "#444", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 2 }}>{selCase.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#ddd8cc" }}>{s?.name}</div>
          <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{selCase.facility} — {selCase.procedure}</div>
          <Bdg bg={st.badge} color={st.bt}>{st.l}</Bdg>
        </div>
        <div>
          {confirmDeleteCase
            ? <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#e05060" }}>Delete case?</span>
                <Btn small color="#e05060" onClick={() => { setCases((p) => p.filter((c) => c.id !== selCase.id)); setSelCaseId(null); setConfirmDeleteCase(false); }}>Yes</Btn>
                <Btn small outline color="#555" onClick={() => setConfirmDeleteCase(false)}>No</Btn>
              </div>
            : <button onClick={() => setConfirmDeleteCase(true)} style={{ background: "none", border: "1px solid #2a2a3e", borderRadius: 6, color: "#444", cursor: "pointer", fontSize: 11, padding: "4px 10px", fontFamily: "inherit" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e05060"; e.currentTarget.style.color = "#e05060"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a3e"; e.currentTarget.style.color = "#444"; }}>Delete Case</button>}
        </div>
      </div>

      <Card style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Lbl>Coverage</Lbl>
          <AcPick value={selCase.coverageAssignee} onChange={(v) => assignCoverageAndTask(selCase.id, v)} />
        </div>
      </Card>

      <Card style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <Lbl>Patient Name</Lbl>
            <input value={selCase.patientName || ""} onChange={(e) => upCase(selCase.id, (c) => ({ ...c, patientName: e.target.value }))} placeholder="Enter patient name..." style={{ width: "100%", padding: "6px 10px", background: "#0d0d14", border: "1px solid #2a2a3e", borderRadius: 7, color: "#ddd8cc", fontFamily: "inherit", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 14, flexShrink: 0 }}>
            <div onClick={() => upCase(selCase.id, (c) => ({ ...c, ctUploaded: !c.ctUploaded }))} style={{ width: 17, height: 17, borderRadius: 4, border: "2px solid " + (selCase.ctUploaded ? "#4a9eff" : "#2a2a3e"), background: selCase.ctUploaded ? "#4a9eff" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", cursor: "pointer", flexShrink: 0 }}>{selCase.ctUploaded ? "✓" : ""}</div>
            <span style={{ fontSize: 12, color: selCase.ctUploaded ? "#4a9eff" : "#555", fontWeight: selCase.ctUploaded ? 700 : 400 }}>CT Uploaded</span>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <Lbl>Sets Confirmed</Lbl>
          <span style={{ fontSize: 10, color: conf === selCase.sets.length && selCase.sets.length > 0 ? "#34a876" : "#555" }}>{conf}/{selCase.sets.length}</span>
        </div>
        {selCase.sets.length === 0 && <div style={{ fontSize: 11, color: "#333", fontStyle: "italic" }}>No sets on this case.</div>}
        {selCase.sets.map((sn, i) => {
          const sc = selCase.setChecks?.[sn] || {};
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: i < selCase.sets.length - 1 ? "1px solid #161620" : "none" }}>
              <div onClick={() => toggleSet(selCase.id, sn)} style={{ width: 17, height: 17, borderRadius: 4, border: "2px solid " + (sc.confirmed ? "#34a876" : "#2a2a3e"), background: sc.confirmed ? "#34a876" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", cursor: "pointer", flexShrink: 0 }}>{sc.confirmed ? "✓" : ""}</div>
              <span style={{ flex: 1, fontSize: 11, color: sc.confirmed ? "#7fe0aa" : "#aaa", textDecoration: sc.confirmed ? "line-through" : "none" }}>{sn}{sc.serial && <span style={{ fontSize: 9, color: "#34a876", marginLeft: 6, fontFamily: "monospace" }}>#{sc.serial}</span>}</span>
              <AcPick value={sc.assignee || null} onChange={(v) => assignSetAndTask(selCase.id, sn, v)} nullable />
            </div>
          );
        })}
        {selCase.sets.length > 0 && <div style={{ fontSize: 9, color: "#333", marginTop: 8, letterSpacing: "0.5px" }}>Assigning a team member creates a task for that set automatically</div>}
      </Card>

      <Card style={{ marginBottom: 10 }}>
        <Lbl>Implants — Restocking</Lbl>
        {selCase.implants.map((imp, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#e0a020", flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 11, color: "#ddd8cc" }}>{imp}</span>
            <button onClick={() => remImp(selCase.id, i)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <Inp value={newImplant} onChange={(e) => setNewImplant(e.target.value)} placeholder="e.g. 54mm Cup..." style={{ fontSize: 11 }} />
          <Btn onClick={addImp} color="#e0a020" text="#0d0d14" small>Log</Btn>
        </div>
      </Card>

      <Card style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
          <div onClick={() => togRet(selCase.id)} style={{ width: 17, height: 17, borderRadius: 4, border: "2px solid " + (selCase.returned ? "#34a876" : "#2a2a3e"), background: selCase.returned ? "#34a876" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", cursor: "pointer", flexShrink: 0 }}>{selCase.returned ? "✓" : ""}</div>
          <span style={{ flex: 1, fontSize: 12, color: selCase.returned ? "#7fe0aa" : "#aaa" }}>Sets returned and checked in</span>
          <AcPick value={selCase.checklistAssignees?.setsReturned || null} onChange={(v) => upCase(selCase.id, (c) => ({ ...c, checklistAssignees: { ...c.checklistAssignees, setsReturned: v } }))} nullable />
        </div>
      </Card>

      <Card style={{ marginBottom: 10 }}>
        <Lbl>Case Notes</Lbl>
        <textarea value={selCase.caseNotes || ""} onChange={(e) => upCase(selCase.id, (c) => ({ ...c, caseNotes: e.target.value }))} placeholder="Add notes for the team — check-in updates, special instructions, questions..." rows={3} style={{ width: "100%", padding: "8px 10px", background: "#0d0d14", border: "1px solid #2a2a3e", borderRadius: 7, color: "#ddd8cc", fontFamily: "inherit", fontSize: 12, outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }} />
        {selCase.caseNotes && <div style={{ fontSize: 9, color: "#444", marginTop: 6, textAlign: "right", letterSpacing: "0.5px" }}>Tap to edit · visible to all reps</div>}
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <Lbl>Check-In Photos</Lbl>
          <label style={{ cursor: "pointer" }}>
            <span style={{ fontSize: 10, color: "#4a9eff", border: "1px solid #4a9eff44", borderRadius: 6, padding: "3px 10px", fontWeight: 700 }}>+ Add</span>
            <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { Array.from(e.target.files).forEach((file) => { const reader = new FileReader(); reader.onload = (ev) => upCase(selCase.id, (c) => ({ ...c, checkInPhotos: [...(c.checkInPhotos || []), { name: file.name, url: ev.target.result }] })); reader.readAsDataURL(file); }); e.target.value = ""; }} />
          </label>
        </div>
        {(selCase.checkInPhotos || []).length === 0
          ? <div style={{ fontSize: 11, color: "#333", textAlign: "center", padding: "12px 0", borderRadius: 7, border: "1px dashed #1e1e2e" }}>No photos yet — tap Add to shoot or attach</div>
          : <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(selCase.checkInPhotos || []).map((p, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={p.url} style={{ width: 78, height: 78, objectFit: "cover", borderRadius: 7, border: "1px solid #2a2a3e", display: "block" }} />
                  <button onClick={() => upCase(selCase.id, (c) => ({ ...c, checkInPhotos: c.checkInPhotos.filter((_, j) => j !== i) }))} style={{ position: "absolute", top: -5, right: -5, width: 17, height: 17, borderRadius: "50%", background: "#e05060", border: "none", color: "#fff", fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>×</button>
                  {p.name && <div style={{ fontSize: 8, color: "#444", marginTop: 2, textAlign: "center", maxWidth: 78, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>}
                </div>
              ))}
            </div>}
      </Card>
    </div>
  );
}
