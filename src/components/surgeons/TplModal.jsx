// ─── Procedure Template Modal ─────────────────────────────────────────────────
import React, { useState } from "react";
import { MW, MT, FL, F, Inp, Sel, TA, Btn } from "../ui";
import { SPECS } from "../../constants/specialties";

export default function TplModal({ tpl, allTrays, onSave, onClose }) {
  const [f, sf]         = useState(tpl ? { ...tpl, trays: [...tpl.trays] } : { id: "tpl-" + Date.now(), name: "", specialty: "Spine", trays: [], positioning: "", roomSetup: "", notes: "" });
  const [setSearch, setSetSearch] = useState("");
  const filteredTrays   = allTrays.filter((t) => t.toLowerCase().includes(setSearch.toLowerCase()));

  return (
    <MW><MT>{tpl ? "Edit" : "New"} Procedure Template</MT>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <F mb={0}><FL>Name</FL><Inp value={f.name} onChange={(e) => sf((p) => ({ ...p, name: e.target.value }))} /></F>
        <F mb={0}><FL>Specialty</FL><Sel value={f.specialty} onChange={(e) => sf((p) => ({ ...p, specialty: e.target.value }))}>{SPECS.map((x) => <option key={x}>{x}</option>)}</Sel></F>
      </div>
      {[["Default Positioning", "positioning"], ["Default Room Setup", "roomSetup"], ["Notes", "notes"]].map(([l, k]) => (
        <F key={k} mb={10}><FL>{l}</FL><TA value={f[k]} onChange={(e) => sf((p) => ({ ...p, [k]: e.target.value }))} /></F>
      ))}
      <F mb={16}><FL>Default Sets</FL>
        {f.trays.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
            {f.trays.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px 3px 10px", background: "#1a2a3d", border: "1px solid #4a9eff44", borderRadius: 20 }}>
                <span style={{ fontSize: 11, color: "#4a9eff" }}>{t}</span>
                <button onClick={() => sf((p) => ({ ...p, trays: p.trays.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", color: "#4a9eff88", cursor: "pointer", fontSize: 13, padding: "0 2px", lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
        )}
        {allTrays.length === 0
          ? <div style={{ fontSize: 11, color: "#555", padding: "8px", background: "#0d0d14", borderRadius: 6, border: "1px dashed #2a2a3e" }}>Add sets in the Sets Library first.</div>
          : <div>
              <Inp value={setSearch} onChange={(e) => setSetSearch(e.target.value)} placeholder="Search sets..." style={{ marginBottom: 7, fontSize: 12 }} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, maxHeight: 130, overflowY: "auto", padding: "2px 0" }}>
                {filteredTrays.map((t) => { const on = f.trays.includes(t); return (
                  <button key={t} onClick={() => sf((p) => ({ ...p, trays: on ? p.trays.filter((x) => x !== t) : [...p.trays, t] }))} style={{ padding: "3px 8px", borderRadius: 5, border: "1px solid " + (on ? "#4a9eff" : "#2a2a3e"), background: on ? "#0d2040" : "transparent", color: on ? "#4a9eff" : "#555", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>
                    {on && <span style={{ marginRight: 3, fontSize: 9 }}>✓</span>}{t}
                  </button>
                ); })}
                {filteredTrays.length === 0 && <div style={{ fontSize: 11, color: "#333", fontStyle: "italic" }}>No sets match "{setSearch}"</div>}
              </div>
            </div>}
      </F>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn outline color="#555" onClick={onClose}>Cancel</Btn>
        <Btn color="#a060e0" onClick={() => f.name.trim() && onSave(f)}>Save Template</Btn>
      </div>
    </MW>
  );
}
