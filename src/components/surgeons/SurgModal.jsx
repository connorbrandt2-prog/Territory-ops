// ─── Add / Edit Surgeon Modal ─────────────────────────────────────────────────
import React, { useState } from "react";
import { MW, MT, FL, F, Inp, Sel, Btn } from "../ui";
import { FACS } from "../../constants/facilities";
import { SPECS } from "../../constants/specialties";

const PRESET_COLORS = ["#e0c020","#34a876","#4a9eff","#e05060","#a060e0","#e0a020","#ff8c42","#7ecfff","#c0c0c0","#ff69b4"];

export default function SurgModal({ surg, onSave, onClose }) {
  const [f, sf] = useState(
    surg
      ? { ...surg }
      : { id: Date.now(), name: "", specialty: "Spine", facility: FACS[0], status: "Active", procedurePrefs: {}, color: null }
  );

  return (
    <MW><MT>{surg ? "Edit" : "Add"} Surgeon</MT>
      <F><FL>Name</FL><Inp value={f.name} onChange={(e) => sf((p) => ({ ...p, name: e.target.value }))} /></F>
      <F><FL>Facility</FL>
        <Sel value={f.facility} onChange={(e) => sf((p) => ({ ...p, facility: e.target.value }))}>
          {FACS.map((x) => <option key={x}>{x}</option>)}
        </Sel>
      </F>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <F mb={0}><FL>Specialty</FL>
          <Sel value={f.specialty} onChange={(e) => sf((p) => ({ ...p, specialty: e.target.value }))}>
            {SPECS.map((x) => <option key={x}>{x}</option>)}
          </Sel>
        </F>
        <F mb={0}><FL>Status</FL>
          <Sel value={f.status} onChange={(e) => sf((p) => ({ ...p, status: e.target.value }))}>
            {["Active", "Occasional", "Inactive"].map((x) => <option key={x}>{x}</option>)}
          </Sel>
        </F>
      </div>
      <F><FL>Color</FL>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {PRESET_COLORS.map((c) => (
            <div key={c} onClick={() => sf((p) => ({ ...p, color: p.color === c ? null : c }))} style={{ width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer", border: f.color === c ? "2px solid #fff" : "2px solid transparent", boxShadow: f.color === c ? "0 0 0 1px " + c : "none", flexShrink: 0 }} />
          ))}
          <input type="color" value={f.color || "#888888"} onChange={(e) => sf((p) => ({ ...p, color: e.target.value }))} title="Custom color" style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid #2a2a3e", background: "#0d0d14", cursor: "pointer", padding: 0, flexShrink: 0 }} />
          {f.color && <button onClick={() => sf((p) => ({ ...p, color: null }))} style={{ fontSize: 10, color: "#555", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Clear</button>}
        </div>
      </F>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn outline color="#555" onClick={onClose}>Cancel</Btn>
        <Btn color="#34a876" onClick={() => f.name.trim() && onSave(f)}>Save</Btn>
      </div>
    </MW>
  );
}
