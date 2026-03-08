// ─── Add / Edit Surgeon Modal ─────────────────────────────────────────────────
import React, { useState } from "react";
import { MW, MT, FL, F, Inp, Sel, Btn } from "../ui";
import { FACS } from "../../constants/facilities";
import { SPECS } from "../../constants/specialties";

export default function SurgModal({ surg, onSave, onClose }) {
  const [f, sf] = useState(
    surg
      ? { ...surg }
      : { id: Date.now(), name: "", specialty: "Spine", facility: FACS[0], status: "Active", procedurePrefs: {} }
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
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn outline color="#555" onClick={onClose}>Cancel</Btn>
        <Btn color="#34a876" onClick={() => f.name.trim() && onSave(f)}>Save</Btn>
      </div>
    </MW>
  );
}
