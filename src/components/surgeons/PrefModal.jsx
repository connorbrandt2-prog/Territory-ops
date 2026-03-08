// ─── Surgeon Procedure Preference Modal ───────────────────────────────────────
import React, { useState } from "react";
import { MW, MT, FL, F, TA, Btn } from "../ui";

export default function PrefModal({ surg, templateId, templates, allTrays, prefPhotos, setPrefPhotos, onSave, onClose }) {
  const tpl = templates.find((t) => t.id === templateId);
  const ex  = surg.procedurePrefs[templateId] || {};
  const [f, sf] = useState({
    trays:           [...(ex.trays    || tpl?.trays    || [])],
    robot:           !!ex.robot,
    stealth:         !!ex.stealth,
    fluoro:          !!ex.fluoro,
    hospitalSets:    ex.hospitalSets    || "",
    roomSetup:       ex.roomSetup       || tpl?.roomSetup  || "",
    positioning:     ex.positioning     || tpl?.positioning || "",
    exposure:        ex.exposure        || "",
    hardwareWorkflow:ex.hardwareWorkflow || "",
    otherInfo:       ex.otherInfo       || "",
  });

  const key    = surg.id + "-" + templateId;
  const photos = prefPhotos[key] || [];
  const addPhoto = (file) => {
    const r = new FileReader();
    r.onload = (e) => setPrefPhotos((p) => ({ ...p, [key]: [...(p[key] || []), { name: file.name, url: e.target.result }] }));
    r.readAsDataURL(file);
  };
  const remPhoto = (i) => setPrefPhotos((p) => ({ ...p, [key]: (p[key] || []).filter((_, j) => j !== i) }));

  const CB = ({ field, label, color }) => (
    <div onClick={() => sf((p) => ({ ...p, [field]: !p[field] }))} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: f[field] ? color + "18" : "#0d0d14", border: "1px solid " + (f[field] ? color : "#2a2a3e"), borderRadius: 9, cursor: "pointer", flex: 1 }}>
      <div style={{ width: 20, height: 20, borderRadius: 5, border: "2px solid " + (f[field] ? color : "#333"), background: f[field] ? color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#0d0d14", fontWeight: 900, flexShrink: 0 }}>{f[field] ? "✓" : ""}</div>
      <span style={{ fontSize: 13, fontWeight: 700, color: f[field] ? color : "#555" }}>{label}</span>
    </div>
  );

  const NOTE_FIELDS = [
    ["Hospital Sets",         "hospitalSets",    "#34a876"],
    ["Room Set-up",           "roomSetup",       null],
    ["Positioning",           "positioning",     null],
    ["Exposure",              "exposure",        null],
    ["Hardware Workflow",     "hardwareWorkflow","#e0a020"],
    ["Other Key Information", "otherInfo",       "#a060e0"],
  ];

  const placeholders = {
    hospitalSets:     "Loaner sets, SPD contacts, lead times...",
    roomSetup:        "Table, equipment layout, C-arm side...",
    positioning:      "Prone, lateral, degrees, bean bag...",
    exposure:         "Incision, retractors, exposure notes...",
    hardwareWorkflow: "Implant sequence, sizing, workflow notes...",
    otherInfo:        "Anything else the team should know...",
  };

  return (
    <MW><MT>Procedure Preferences — {surg.name}</MT>
      <div style={{ fontSize: 11, color: "#555", marginBottom: 14 }}>{tpl?.name}</div>
      <F mb={14}><FL>Instrumentation</FL>
        {allTrays.length === 0
          ? <div style={{ fontSize: 11, color: "#555", padding: "8px", background: "#0d0d14", borderRadius: 6, border: "1px dashed #2a2a3e" }}>Add sets in Sets Library first.</div>
          : <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{allTrays.map((t) => { const on = f.trays.includes(t); return <button key={t} onClick={() => sf((p) => ({ ...p, trays: on ? p.trays.filter((x) => x !== t) : [...p.trays, t] }))} style={{ padding: "3px 8px", borderRadius: 5, border: "1px solid " + (on ? "#34a876" : "#2a2a3e"), background: on ? "#1a3d2b" : "transparent", color: on ? "#34a876" : "#333", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>{t}</button>; })}</div>}
      </F>
      <F mb={16}><FL>Technology</FL>
        <div style={{ display: "flex", gap: 8 }}>
          <CB field="robot"   label="Robot"  color="#4a9eff" />
          <CB field="stealth" label="Stealth" color="#e05060" />
          <CB field="fluoro"  label="Fluoro"  color="#888" />
        </div>
      </F>
      {NOTE_FIELDS.map(([label, k, color]) => (
        <F key={k} mb={12}>
          <FL color={color || "#555"}>{label}</FL>
          <TA value={f[k]} onChange={(e) => sf((p) => ({ ...p, [k]: e.target.value }))} rows={2} placeholder={placeholders[k]} />
        </F>
      ))}
      <F mb={16}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <FL color="#a060e0">Reference Photos</FL>
          <label style={{ cursor: "pointer" }}>
            <span style={{ fontSize: 10, color: "#a060e0", border: "1px solid #3a1a6a", borderRadius: 6, padding: "3px 10px", fontWeight: 700 }}>+ Add Images</span>
            <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { Array.from(e.target.files).forEach(addPhoto); e.target.value = ""; }} />
          </label>
        </div>
        {photos.length === 0
          ? <div style={{ fontSize: 11, color: "#333", padding: "12px", background: "#0d0d14", borderRadius: 7, border: "1px dashed #2a2a3e", textAlign: "center" }}>No images yet — add positioning guides, OR diagrams, or setup photos</div>
          : <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {photos.map((p, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={p.url} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 7, border: "1px solid #2a2a3e", display: "block" }} />
                  <button onClick={() => remPhoto(i)} style={{ position: "absolute", top: -5, right: -5, width: 17, height: 17, borderRadius: "50%", background: "#e05060", border: "none", color: "#fff", fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>×</button>
                  {p.name && <div style={{ fontSize: 8, color: "#444", marginTop: 2, textAlign: "center", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>}
                </div>
              ))}
            </div>}
      </F>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn outline color="#555" onClick={onClose}>Cancel</Btn>
        <Btn color="#34a876" onClick={() => onSave(templateId, f)}>Save Preferences</Btn>
      </div>
    </MW>
  );
}
