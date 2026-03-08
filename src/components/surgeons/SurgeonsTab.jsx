// ─── Surgeons Tab ─────────────────────────────────────────────────────────────
import React, { useState } from "react";
import { Card, Lbl, Btn } from "../ui";
import { SPEC_COLOR } from "../../constants/theme";

export default function SurgeonsTab({
  isMobile, surgeons, setSurgeons, templates, setTemplates, allTrays,
  trayPhotos, prefPhotos, setPrefPhotos, addTrayPhoto, addPrefPhoto, remPrefPhoto,
  setShowAddSurg, setEditSurgId, setShowAddTpl, setEditTplId, setEditPrefKey,
  setTab, selSurgId, setSelSurgId,
}) {
  const [surgView,             setSurgView]             = useState("surgeon");
  const [selProcTab,           setSelProcTab]           = useState("");
  const [prefSection,          setPrefSection]          = useState("sets");
  const [selTplId,             setSelTplId]             = useState(null);
  const [tplPanelOpen,         setTplPanelOpen]         = useState(false);
  const [addingProfile,        setAddingProfile]        = useState(false);
  const [newProfileName,       setNewProfileName]       = useState("");
  const [confirmDeleteProfKey, setConfirmDeleteProfKey] = useState(null);
  const [confirmDeleteSurgId,  setConfirmDeleteSurgId]  = useState(null);

  const selSurg = surgeons.find((s) => s.id === selSurgId) || null;
  const selTpl  = templates.find((t) => t.id === selTplId) || null;
  const gt      = (id) => templates.find((t) => t.id === id);
  const sc      = SPEC_COLOR[selSurg?.specialty] || "#888";
  const procIds = selSurg ? Object.keys(selSurg.procedurePrefs) : [];
  const activePref = selSurg?.procedurePrefs[selProcTab];
  const activeTpl  = gt(selProcTab);

  const createProfile = (name) => {
    if (!name.trim() || !selSurgId) return;
    const id = "tpl-" + Date.now();
    const nt = { id, name: name.trim(), specialty: selSurg?.specialty || "Spine", trays: [], positioning: "", roomSetup: "", notes: "" };
    setTemplates((p) => [...p, nt]);
    setSurgeons((p) => p.map((s) => s.id === selSurgId ? { ...s, procedurePrefs: { ...s.procedurePrefs, [id]: nt } } : s));
    setSelProcTab(id);
    setEditPrefKey(id);
    setNewProfileName("");
    setAddingProfile(false);
  };

  const deleteProfKey = (tid) => {
    setSurgeons((p) => p.map((s) => s.id === selSurgId ? { ...s, procedurePrefs: Object.fromEntries(Object.entries(s.procedurePrefs).filter(([k]) => k !== tid)) } : s));
    const remaining = procIds.filter((k) => k !== tid);
    setSelProcTab(remaining[0] || "");
    setConfirmDeleteProfKey(null);
  };

  const ProfileTabs = () => (
    <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
      {procIds.map((tid) => { const tpl = gt(tid); const isPending = confirmDeleteProfKey === tid; return (
        <div key={tid} style={{ display: "flex", alignItems: "center", borderRadius: 20, border: "1px solid " + (isPending ? "#e05060" : selProcTab === tid ? sc : "#2a2a3e"), background: isPending ? "#3d1520" : selProcTab === tid ? sc + "22" : "transparent", overflow: "hidden" }}>
          <button onClick={() => { setSelProcTab(tid); setPrefSection("sets"); setConfirmDeleteProfKey(null); }} style={{ padding: "5px 10px", background: "transparent", border: "none", color: isPending ? "#e05060" : selProcTab === tid ? sc : "#555", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: selProcTab === tid ? 700 : 400 }}>{tpl?.name || tid}</button>
          {isPending
            ? <><button onClick={() => deleteProfKey(tid)} style={{ padding: "3px 8px", background: "#e05060", border: "none", color: "#fff", fontSize: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>Del</button><button onClick={() => setConfirmDeleteProfKey(null)} style={{ padding: "3px 8px", background: "transparent", border: "none", color: "#888", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>✕</button></>
            : <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteProfKey(tid); }} style={{ padding: "3px 8px 3px 0", background: "transparent", border: "none", color: "#2a2a3e", fontSize: 14, cursor: "pointer", lineHeight: 1 }} onMouseEnter={(e) => (e.currentTarget.style.color = "#e05060")} onMouseLeave={(e) => (e.currentTarget.style.color = "#2a2a3e")}>×</button>}
        </div>
      ); })}
      {addingProfile
        ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input autoFocus value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") createProfile(newProfileName); if (e.key === "Escape") { setAddingProfile(false); setNewProfileName(""); } }} placeholder="Profile name..." style={{ padding: "4px 9px", background: "#0d0d14", border: "1px solid #4a9eff", borderRadius: 20, color: "#ddd8cc", fontFamily: "inherit", fontSize: 11, outline: "none", width: 130 }} />
            <button onClick={() => createProfile(newProfileName)} style={{ padding: "4px 10px", background: "#4a9eff", border: "none", borderRadius: 20, color: "#0d0d14", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Add</button>
            <button onClick={() => { setAddingProfile(false); setNewProfileName(""); }} style={{ padding: "4px 8px", background: "transparent", border: "1px solid #2a2a3e", borderRadius: 20, color: "#555", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          </div>
        : <button onClick={() => { setAddingProfile(true); setNewProfileName(""); }} style={{ padding: "5px 12px", borderRadius: 20, border: "1px dashed #4a9eff", background: "transparent", color: "#4a9eff", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>+ Add Profile</button>}
    </div>
  );

  const PrefView = () => {
    if (!activePref || !activeTpl) {
      return (
        <Card style={{ textAlign: "center", padding: 28 }}>
          <div style={{ color: "#444", fontSize: 13, marginBottom: 16 }}>No procedure profiles yet for {selSurg?.name}</div>
          {addingProfile
            ? <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center" }}>
                <input autoFocus value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") createProfile(newProfileName); if (e.key === "Escape") { setAddingProfile(false); setNewProfileName(""); } }} placeholder="e.g. MIS TLIF, ACDF..." style={{ padding: "7px 12px", background: "#0d0d14", border: "1px solid #4a9eff", borderRadius: 8, color: "#ddd8cc", fontFamily: "inherit", fontSize: 13, outline: "none", width: 180 }} />
                <Btn color="#4a9eff" onClick={() => createProfile(newProfileName)}>Create</Btn>
                <Btn outline color="#555" onClick={() => { setAddingProfile(false); setNewProfileName(""); }}>Cancel</Btn>
              </div>
            : <Btn color="#4a9eff" onClick={() => setAddingProfile(true)}>+ Add First Profile</Btn>}
        </Card>
      );
    }
    const NF = [["Hospital Sets","hospitalSets","#34a876"],["Room Set-up","roomSetup",null],["Positioning","positioning",null],["Exposure","exposure",null],["Hardware Workflow","hardwareWorkflow","#e0a020"],["Other Key Information","otherInfo","#a060e0"]];
    const hasTech = activePref.robot || activePref.stealth || activePref.fluoro;
    const key     = selSurgId + "-" + selProcTab;
    const photos  = prefPhotos[key] || [];
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[["sets","Sets"],["notes","Notes"],["hospital","Hospital"],["images","Images"]].map(([k, l]) => (
              <button key={k} onClick={() => setPrefSection(k)} style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid " + (prefSection === k ? "#ddd8cc44" : "#2a2a3e"), background: prefSection === k ? "#1e1e2e" : "transparent", color: prefSection === k ? "#ddd8cc" : "#555", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: prefSection === k ? 700 : 400 }}>{l}</button>
            ))}
          </div>
          <Btn small color={sc} text="#0d0d14" onClick={() => setEditPrefKey(selProcTab)}>Edit</Btn>
        </div>
        {prefSection === "sets" && (
          <Card>
            <Lbl>Instrument Sets</Lbl>
            {activePref.trays.length === 0 ? <div style={{ color: "#333", fontSize: 11 }}>No sets. Click Edit to add.</div>
              : activePref.trays.map((t, i) => { const hp = !!trayPhotos[t]; return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 0", borderBottom: i < activePref.trays.length - 1 ? "1px solid #161620" : "none" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: sc, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#ddd8cc", flex: 1 }}>{t}</span>
                    {hp ? <img src={trayPhotos[t]} style={{ width: 30, height: 30, borderRadius: 5, objectFit: "cover", border: "1px solid #2a2a3e" }} />
                       : <label style={{ cursor: "pointer" }}><span style={{ fontSize: 10, color: "#333", border: "1px dashed #2a2a3e", borderRadius: 5, padding: "2px 6px" }}>+photo</span><input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files[0] && addTrayPhoto(t, e.target.files[0])} /></label>}
                  </div>
                ); })}
          </Card>
        )}
        {prefSection === "notes" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {hasTech && <Card><Lbl>Technology</Lbl><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{activePref.robot && <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#4a9eff18", border: "1px solid #4a9eff", borderRadius: 7 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4a9eff" }} /><span style={{ fontSize: 12, color: "#4a9eff", fontWeight: 700 }}>Robot</span></div>}{activePref.stealth && <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#e0506018", border: "1px solid #e05060", borderRadius: 7 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#e05060" }} /><span style={{ fontSize: 12, color: "#e05060", fontWeight: 700 }}>Stealth</span></div>}{activePref.fluoro && <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#88888818", border: "1px solid #888", borderRadius: 7 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#888" }} /><span style={{ fontSize: 12, color: "#888", fontWeight: 700 }}>Fluoro</span></div>}</div></Card>}
            {NF.map(([label, k, color]) => activePref[k] ? <Card key={k}><Lbl color={color || "#444"}>{label}</Lbl><div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{activePref[k]}</div></Card> : null)}
            {!hasTech && !NF.some(([, k]) => activePref[k]) && <div style={{ color: "#333", fontSize: 11 }}>No notes yet. Click Edit to add.</div>}
          </div>
        )}
        {prefSection === "hospital" && <Card accent="#4a9eff33"><Lbl color="#4a9eff">Hospital and Set Logistics</Lbl>{activePref.hospitalSets ? <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{activePref.hospitalSets}</div> : <div style={{ color: "#333", fontSize: 12 }}>No hospital notes yet. Click Edit to add.</div>}</Card>}
        {prefSection === "images" && (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Lbl>Procedure Reference Photos</Lbl>
              <label style={{ cursor: "pointer" }}><span style={{ fontSize: 11, color: "#a060e0", border: "1px solid #3a1a6a", borderRadius: 6, padding: "4px 12px", fontWeight: 700 }}>+ Add</span><input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { Array.from(e.target.files).forEach((f) => addPrefPhoto(selSurgId, selProcTab, f)); e.target.value = ""; }} /></label>
            </div>
            {photos.length === 0 ? <div style={{ color: "#333", fontSize: 12, textAlign: "center", padding: "20px 0" }}>No images yet — add positioning guides, OR diagrams, or reference photos.</div>
              : <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {photos.map((p, i) => (<div key={i} style={{ position: "relative" }}><img src={p.url} style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid #2a2a3e", display: "block" }} /><button onClick={() => remPrefPhoto(selSurgId, selProcTab, i)} style={{ position: "absolute", top: -5, right: -5, width: 18, height: 18, borderRadius: "50%", background: "#e05060", border: "none", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>×</button>{p.name && <div style={{ fontSize: 8, color: "#444", marginTop: 3, textAlign: "center", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>}</div>))}
                </div>}
          </Card>
        )}
      </div>
    );
  };

  const TemplateView = ({ tpl: t }) => {
    if (!t) return <div style={{ color: "#333" }}>Select a template</div>;
    const sc2   = SPEC_COLOR[t.specialty] || "#888";
    const using = surgeons.filter((s) => Object.keys(s.procedurePrefs).includes(t.id));
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div><div style={{ fontSize: 9, color: "#555", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 3 }}>Template — {t.specialty}</div><div style={{ fontSize: 20, fontWeight: 700, color: "#ddd8cc" }}>{t.name}</div><div style={{ fontSize: 11, color: "#444", marginTop: 3 }}>{using.length} surgeon{using.length !== 1 ? "s" : ""} with custom profiles</div></div>
          <div style={{ display: "flex", gap: 8 }}><Btn small outline color="#a060e0" onClick={() => setEditTplId(t.id)}>Edit</Btn><Btn small outline color="#555" onClick={() => setSurgView("surgeon")}>Back</Btn></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Card><Lbl>Default Sets</Lbl>{t.trays.length === 0 ? <div style={{ color: "#333", fontSize: 11 }}>No sets defined</div> : t.trays.map((tr, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 0", borderBottom: i < t.trays.length - 1 ? "1px solid #161620" : "none" }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: sc2, flexShrink: 0 }} /><span style={{ fontSize: 12, color: "#ddd8cc" }}>{tr}</span></div>))}</Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {t.positioning && <Card><Lbl>Positioning</Lbl><div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.7 }}>{t.positioning}</div></Card>}
            {t.roomSetup   && <Card><Lbl>Room Setup</Lbl><div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.7 }}>{t.roomSetup}</div></Card>}
          </div>
          {t.notes && <Card accent={sc2 + "33"} style={{ gridColumn: "1/-1" }}><Lbl>Notes</Lbl><div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.7 }}>{t.notes}</div></Card>}
        </div>
        {using.length > 0 && <Card><Lbl>Surgeons with Custom Profiles</Lbl>{using.map((s) => (<div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #161620" }}><div><div style={{ fontSize: 12, color: "#ddd8cc" }}>{s.name}</div><div style={{ fontSize: 10, color: "#444" }}>{s.facility}</div></div><Btn small outline color="#4a9eff" onClick={() => { setSelSurgId(s.id); setSelProcTab(t.id); setSurgView("surgeon"); setPrefSection("sets"); }}>View</Btn></div>))}</Card>}
      </div>
    );
  };

  const SurgeonDetail = () => {
    if (!selSurg) return <div style={{ color: "#333", display: "flex", alignItems: "center", justifyContent: "center", height: "60%" }}>Select a surgeon</div>;
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div><div style={{ fontSize: 10, color: sc, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 3 }}>{selSurg.specialty} — {selSurg.status}</div><div style={{ fontSize: 20, fontWeight: 700, color: "#ddd8cc" }}>{selSurg.name}</div><div style={{ fontSize: 12, color: "#444", marginTop: 2 }}>{selSurg.facility}</div></div>
          <Btn small outline color="#ddd8cc" onClick={() => setEditSurgId(selSurg.id)}>Edit</Btn>
        </div>
        <ProfileTabs />
        <PrefView />
      </div>
    );
  };

  // ── MOBILE: surgeon list ──
  if (isMobile && !selSurgId) {
    return (
      <div style={{ height: "calc(100dvh - 112px)", overflowY: "auto", paddingBottom: 80 }}>
        <div style={{ padding: "8px 14px", borderBottom: "1px solid #1e1e2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 8, letterSpacing: "2px", color: "#444", textTransform: "uppercase" }}>Surgeons</span>
          <Btn small color="#34a876" onClick={() => setShowAddSurg(true)} style={{ padding: "2px 7px", fontSize: 9 }}>+ Add</Btn>
        </div>
        {surgeons.map((s) => { const sc2 = SPEC_COLOR[s.specialty] || "#888"; return (
          <div key={s.id} onClick={() => { setSelSurgId(s.id); setSurgView("surgeon"); const tids = Object.keys(s.procedurePrefs); if (tids.length) { setSelProcTab(tids[0]); setPrefSection("sets"); } }} style={{ padding: "12px 14px", borderBottom: "1px solid #161620", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: sc2 + "33", border: "2px solid " + sc2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: sc2, fontWeight: 700, flexShrink: 0 }}>{s.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#ddd8cc" }}>{s.name}</div>
              <div style={{ fontSize: 11, color: sc2, fontStyle: "italic" }}>{s.specialty}</div>
              <div style={{ fontSize: 10, color: "#333" }}>{Object.keys(s.procedurePrefs).length} profiles · {s.facility}</div>
            </div>
            <span style={{ color: "#333", fontSize: 18 }}>›</span>
          </div>
        ); })}
      </div>
    );
  }

  // ── MOBILE: surgeon detail ──
  if (isMobile && selSurgId) {
    return (
      <div style={{ height: "calc(100dvh - 112px)", overflowY: "auto" }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid #1e1e2e" }}>
          <button onClick={() => setSelSurgId(null)} style={{ background: "none", border: "none", color: "#4a9eff", cursor: "pointer", fontSize: 13, fontFamily: "inherit", padding: 0 }}>← Surgeons</button>
        </div>
        <div style={{ padding: "14px 14px 80px" }}>
          {surgView === "template" ? <TemplateView tpl={selTpl} /> : <SurgeonDetail />}
        </div>
      </div>
    );
  }

  // ── DESKTOP: side-by-side ──
  return (
    <div style={{ display: "flex", height: "calc(100dvh - 122px)", overflow: "hidden" }}>
      {/* Left sidebar */}
      <div style={{ width: 170, background: "#111119", borderRight: "1px solid #1e1e2e", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ padding: "8px 10px", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 8, letterSpacing: "2px", color: "#444", textTransform: "uppercase" }}>Surgeons</span>
          <Btn small color="#34a876" onClick={() => setShowAddSurg(true)} style={{ padding: "2px 7px", fontSize: 9 }}>+ Add</Btn>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {surgeons.map((s) => { const sc2 = SPEC_COLOR[s.specialty] || "#888"; const isSel = selSurgId === s.id && surgView === "surgeon"; return (
            <div key={s.id} style={{ borderBottom: "1px solid #161620", background: isSel ? "#161628" : "transparent", borderLeft: "3px solid " + (isSel ? sc2 : "transparent") }}>
              {confirmDeleteSurgId === s.id
                ? <div style={{ padding: "8px 10px", background: "#1e0a0a" }}>
                    <div style={{ fontSize: 10, color: "#e05060", marginBottom: 7 }}>Delete {s.name}?</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setSurgeons((p) => p.filter((x) => x.id !== s.id)); if (selSurgId === s.id) { const r = surgeons.filter((x) => x.id !== s.id); setSelSurgId(r[0]?.id || null); } setConfirmDeleteSurgId(null); }} style={{ flex: 1, padding: "4px 0", background: "#e05060", border: "none", borderRadius: 5, color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
                      <button onClick={() => setConfirmDeleteSurgId(null)} style={{ flex: 1, padding: "4px 0", background: "#1e1e2e", border: "1px solid #2a2a3e", borderRadius: 5, color: "#aaa", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                    </div>
                  </div>
                : <div style={{ display: "flex", alignItems: "center" }}>
                    <div onClick={() => { setSelSurgId(s.id); setSurgView("surgeon"); setAddingProfile(false); const tids = Object.keys(s.procedurePrefs); if (tids.length) { setSelProcTab(tids[0]); setPrefSection("sets"); } }} style={{ flex: 1, padding: "9px 10px", cursor: "pointer" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#ddd8cc" }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: sc2, marginTop: 1, fontStyle: "italic" }}>{s.specialty}</div>
                      <div style={{ fontSize: 9, color: "#333", marginTop: 1 }}>{Object.keys(s.procedurePrefs).length} profiles</div>
                    </div>
                    <button onClick={() => setConfirmDeleteSurgId(s.id)} style={{ background: "none", border: "none", color: "#2a2a3e", cursor: "pointer", fontSize: 16, padding: "0 8px", flexShrink: 0, lineHeight: 1 }} onMouseEnter={(e) => (e.currentTarget.style.color = "#e05060")} onMouseLeave={(e) => (e.currentTarget.style.color = "#2a2a3e")}>×</button>
                  </div>}
            </div>
          ); })}
        </div>
        {/* Templates panel */}
        <div style={{ borderTop: "1px solid #1e1e2e", flexShrink: 0 }}>
          <div onClick={() => setTplPanelOpen((x) => !x)} style={{ padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: "#0d0d14" }}>
            <span style={{ fontSize: 8, letterSpacing: "2px", color: "#555", textTransform: "uppercase" }}>Templates</span>
            <span style={{ color: "#444", fontSize: 10 }}>{tplPanelOpen ? "▲" : "▼"}</span>
          </div>
          {tplPanelOpen && (
            <div style={{ maxHeight: 180, overflowY: "auto", background: "#0d0d14" }}>
              <div style={{ padding: "5px 10px", borderBottom: "1px solid #161620" }}><Btn small color="#a060e0" onClick={() => setShowAddTpl(true)} style={{ width: "100%", padding: "4px", fontSize: 9 }}>+ New Template</Btn></div>
              {templates.map((t) => { const sc2 = SPEC_COLOR[t.specialty] || "#888"; const isSel = selTplId === t.id && surgView === "template"; return (<div key={t.id} onClick={() => { setSelTplId(t.id); setSurgView("template"); }} style={{ padding: "8px 10px", borderBottom: "1px solid #161620", cursor: "pointer", background: isSel ? "#16161e" : "transparent", borderLeft: "3px solid " + (isSel ? sc2 : "transparent") }}><div style={{ fontSize: 11, color: "#ddd8cc" }}>{t.name}</div><div style={{ fontSize: 9, color: sc2, marginTop: 1 }}>{t.specialty} · {t.trays.length} sets</div></div>); })}
              {templates.length === 0 && <div style={{ padding: "10px", fontSize: 10, color: "#333", fontStyle: "italic" }}>No templates yet</div>}
            </div>
          )}
          <div style={{ borderTop: "1px solid #1e1e2e", padding: "8px 10px", background: "#0d0d14" }}>
            <div style={{ fontSize: 8, letterSpacing: "2px", color: "#34a876", textTransform: "uppercase", marginBottom: 6 }}>Sets Library</div>
            <div style={{ fontSize: 10, color: "#555", marginBottom: 8 }}>{allTrays.length} sets · managed in Inventory tab</div>
            <button onClick={() => setTab("inventory")} style={{ width: "100%", padding: "5px 8px", background: "#34a87622", border: "1px solid #34a87644", borderRadius: 6, color: "#34a876", fontFamily: "inherit", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>→ Manage Sets in Inventory</button>
          </div>
        </div>
      </div>
      {/* Right content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px" }}>
        {surgView === "template" ? <TemplateView tpl={selTpl} /> : <SurgeonDetail />}
      </div>
    </div>
  );
}
