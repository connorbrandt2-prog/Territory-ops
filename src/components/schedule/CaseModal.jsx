// ─── Schedule New Case Modal ──────────────────────────────────────────────────
import React, { useState } from "react";
import { MW, MT, FL, F, Inp, Sel, Btn, AcPick } from "../ui";
import { FACS } from "../../constants/facilities";

export default function CaseModal({ surgeons, allTrays, currentUser, initialDate, onSave, onClose }) {
  if (!surgeons.length) return (
    <MW><MT>No Surgeons</MT>
      <div style={{ color: "#555", fontSize: 13, marginBottom: 16 }}>Add a surgeon first.</div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><Btn outline color="#555" onClick={onClose}>Close</Btn></div>
    </MW>
  );

  const fs         = surgeons[0];
  const prefillDate = initialDate instanceof Date ? initialDate.toLocaleDateString("en-CA") : "";
  const [f, sf]    = useState({ date: prefillDate, surgeonId: fs.id, facility: fs.facility || FACS[0], procedure: "", prefKey: "", sets: [], setChecks: {}, returned: false, implants: [], checkInPhotos: [], coverageAssignee: currentUser, checklistAssignees: { setsReturned: currentUser, implants: currentUser } });

  const selSurg    = surgeons.find((s) => s.id === f.surgeonId) || fs;
  const profiles   = Object.entries(selSurg.procedurePrefs || {});

  const applyPref = (profileKey) => {
    const pref = selSurg.procedurePrefs[profileKey];
    if (!pref) return;
    const sets = pref.trays || [];
    const setChecks = {};
    sets.forEach((t) => { setChecks[t] = { confirmed: false, assignee: null }; });
    sf((p) => ({ ...p, prefKey: profileKey, procedure: pref.name || p.procedure, sets, setChecks }));
  };

  const tT = (t) => {
    const on = f.sets.includes(t);
    const sets = on ? f.sets.filter((x) => x !== t) : [...f.sets, t];
    const sc = { ...f.setChecks };
    if (!on) sc[t] = { confirmed: false, assignee: null }; else delete sc[t];
    sf((p) => ({ ...p, sets, setChecks: sc }));
  };

  const changeSurgeon = (e) => {
    const s = surgeons.find((x) => x.id === parseInt(e.target.value));
    if (s) sf((p) => ({ ...p, surgeonId: s.id, facility: s.facility, prefKey: "", sets: [], setChecks: {} }));
  };

  const TIMES = ["5:30 AM","6:00 AM","6:30 AM","7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM"];

  return (
    <MW><MT>Schedule New Case</MT>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 11 }}>
        <F mb={0}><FL>Date</FL><Inp type="date" value={f.date} onChange={(e) => sf((p) => ({ ...p, date: e.target.value }))} /></F>
        <F mb={0}><FL>Time</FL><Sel value={f.time || ""} onChange={(e) => sf((p) => ({ ...p, time: e.target.value }))}><option value="">TBD</option>{TIMES.map((t) => <option key={t} value={t}>{t}</option>)}</Sel></F>
        <F mb={0}><FL>Coverage</FL><div style={{ paddingTop: 4 }}><AcPick value={f.coverageAssignee} onChange={(v) => sf((p) => ({ ...p, coverageAssignee: v || currentUser }))} /></div></F>
      </div>
      <F><FL>Surgeon</FL><Sel value={f.surgeonId} onChange={changeSurgeon}>{surgeons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Sel></F>
      <F><FL>Facility</FL><Sel value={f.facility} onChange={(e) => sf((p) => ({ ...p, facility: e.target.value }))}>{FACS.map((x) => <option key={x}>{x}</option>)}</Sel></F>

      {profiles.length > 0 && (
        <F mb={14}>
          <FL color="#34a876">Preference Profile</FL>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: f.prefKey ? 8 : 0 }}>
            {profiles.map(([key, pref]) => {
              const active = f.prefKey === key;
              return (
                <button key={key} onClick={() => active ? sf((p) => ({ ...p, prefKey: "", sets: [], setChecks: {} })) : applyPref(key)} style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid " + (active ? "#34a876" : "#2a2a3e"), background: active ? "#1a3d2b" : "transparent", color: active ? "#34a876" : "#555", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: active ? 700 : 400, display: "flex", alignItems: "center", gap: 5 }}>
                  {active && <span style={{ fontSize: 9 }}>✓</span>}{pref.name || key}
                </button>
              );
            })}
          </div>
          {f.prefKey && <div style={{ fontSize: 10, color: "#34a876", padding: "4px 10px", background: "#0d1a0d", borderRadius: 6, border: "1px solid #34a87633" }}>Sets auto-populated from {selSurg.name}'s preference card — you can still adjust below</div>}
        </F>
      )}

      <F><FL>Procedure</FL><Inp value={f.procedure} onChange={(e) => sf((p) => ({ ...p, procedure: e.target.value }))} placeholder="e.g. L4-S1 MIS TLIF" /></F>
      <F mb={18}>
        <FL>Instrument Sets {f.sets.length > 0 && <span style={{ color: "#4a9eff", fontWeight: 400, fontSize: 10 }}>({f.sets.length} selected)</span>}</FL>
        {allTrays.length === 0
          ? <div style={{ fontSize: 11, color: "#555", padding: "8px", background: "#0d0d14", borderRadius: 6, border: "1px dashed #2a2a3e" }}>Add sets in the Sets Library (Surgeons tab) first.</div>
          : <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{allTrays.map((t) => { const on = f.sets.includes(t); return <button key={t} onClick={() => tT(t)} style={{ padding: "3px 8px", borderRadius: 5, border: "1px solid " + (on ? "#4a9eff" : "#2a2a3e"), background: on ? "#0d2040" : "transparent", color: on ? "#4a9eff" : "#333", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>{t}</button>; })}</div>}
      </F>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn outline color="#555" onClick={onClose}>Cancel</Btn>
        <Btn color="#4a9eff" onClick={() => { if (!f.procedure.trim() || !f.date) return; onSave({ ...f, id: Date.now(), date: new Date(f.date + "T12:00:00") }); }}>Schedule Case</Btn>
      </div>
    </MW>
  );
}
