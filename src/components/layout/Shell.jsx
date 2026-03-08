// ─── Application Shell ────────────────────────────────────────────────────────
//
// The Shell is the top-level authenticated container. It owns all shared
// application state and passes slices down to each tab component.
//
// State ownership philosophy:
//   • SHARED DATA  (surgeons, cases, tasks, loaners, assets) lives here
//   • TAB-LOCAL UI state (which item is selected, modal open flags) lives in tabs
//   • Future: replace useState with API-backed state management (React Query /
//     SWR) once a backend exists. Each team's data will be fetched by teamId.
//
// TODO (Persistence): Currently all data resets on page refresh.
//   Short term: localStorage.
//   Long term: Supabase / Postgres + Row Level Security to isolate team data.

import React, { useState } from "react";
import { abt }          from "../../constants/accounts";
import { FACS, ALL_LOC, locById } from "../../constants/facilities";
import { TODAY }        from "../../constants/theme";
import { sameDay }      from "../../utils/dates";
import { getWeek }      from "../../utils/dates";

// Layout
import { Dot, Btn }     from "../ui";

// Tabs
import HomeTab          from "../home/HomeTab";
import ScheduleTab      from "../schedule/ScheduleTab";
import SurgeonsTab      from "../surgeons/SurgeonsTab";
import TasksTab         from "../tasks/TasksTab";
import LoanersTab       from "../loaners/LoanersTab";
import InventoryTab     from "../inventory/InventoryTab";

// Modals
import CaseModal        from "../schedule/CaseModal";
import SurgModal        from "../surgeons/SurgModal";
import PrefModal        from "../surgeons/PrefModal";
import TplModal         from "../surgeons/TplModal";
import TaskModal        from "../tasks/TaskModal";
import LoanerModal      from "../loaners/LoanerModal";
import BulkScanModal    from "../inventory/BulkScanModal";
import ScanMoveModal    from "../inventory/ScanMoveModal";

export default function Shell({ u, onLogout }) {
  const me = abt(u);

  // ── Responsive ────────────────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 700);
  React.useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // ── Navigation ────────────────────────────────────────────────────────────
  const [tab, setTab] = useState("home");

  // ── Shared Data ───────────────────────────────────────────────────────────
  const [surgeons, setSurgeons] = useState([
    { id: 1, name: "Dr. Shaw",         specialty: "Spine",      facility: "LDS Hospital",       status: "Active", procedurePrefs: {} },
    { id: 2, name: "Dr. James Okafor", specialty: "Hip & Knee", facility: "TOSH",               status: "Active", procedurePrefs: {} },
    { id: 3, name: "Dr. Linda Cheng",  specialty: "Spine",      facility: "University of Utah", status: "Active", procedurePrefs: {} },
  ]);
  const [cases,    setCases]    = useState([]);
  const [tasks,    setTasks]    = useState([]);
  const [loaners,  setLoaners]  = useState([]);
  const [assets,   setAssets]   = useState([]);

  // Derived
  const allTrays = [...new Set(assets.map((a) => a.setType || a.name).filter(Boolean))].sort();

  // ── Schedule State ────────────────────────────────────────────────────────
  const [weekAnchor,    setWeekAnchor]    = useState(TODAY);
  const [selCaseId,     setSelCaseId]     = useState(null);
  const [schedFilter,   setSchedFilter]   = useState("all");
  const [newImplant,    setNewImplant]    = useState("");
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [newCaseDate,   setNewCaseDate]   = useState(null);

  const week       = getWeek(weekAnchor);
  const schedCases = schedFilter === "mine" ? cases.filter((c) => c.coverageAssignee === u) : cases;
  const weekCases  = schedCases.filter((c) => week.some((d) => sameDay(d, c.date)));
  const upcoming   = [...schedCases].filter((c) => c.date >= TODAY || sameDay(c.date, TODAY)).sort((a, b) => a.date - b.date);

  // ── Surgeons Modal State ───────────────────────────────────────────────────
  const [showAddSurg,  setShowAddSurg]  = useState(false);
  const [editSurgId,   setEditSurgId]   = useState(null);
  const [showAddTpl,   setShowAddTpl]   = useState(false);
  const [editTplId,    setEditTplId]    = useState(null);
  const [editPrefKey,  setEditPrefKey]  = useState(null);
  const [templates,    setTemplates]    = useState([]);
  const [trayPhotos,   setTrayPhotos]   = useState({});
  const [prefPhotos,   setPrefPhotos]   = useState({});
  const [selSurgId,    setSelSurgId]    = useState(surgeons[0]?.id || null);

  // ── Tasks State ───────────────────────────────────────────────────────────
  const [taskFilter, setTaskFilter] = useState("open");
  const [taskOwner,  setTaskOwner]  = useState("mine");
  const [showAddTask, setShowAddTask] = useState(false);
  const [editTask,    setEditTask]    = useState(null);

  const filteredTasks = tasks.filter((t) => {
    const o = taskOwner === "mine" ? t.assignee === u : true;
    const s = taskFilter === "all" || (taskFilter === "open" && !t.done) || (taskFilter === "done" && t.done);
    return o && s;
  });
  const myOpenCount = tasks.filter((t) => t.assignee === u && !t.done).length;

  // ── Loaners State ─────────────────────────────────────────────────────────
  const [showAddLoaner, setShowAddLoaner] = useState(false);
  const [editLoaner,    setEditLoaner]    = useState(null);

  // ── Inventory State ───────────────────────────────────────────────────────
  const [invFilter,     setInvFilter]     = useState("all");
  const [invSearch,     setInvSearch]     = useState("");
  const [invTab,        setInvTab]        = useState("sets");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showScanMove,  setShowScanMove]  = useState(false);
  const [showBulkScan,  setShowBulkScan]  = useState(false);
  const [newTray,       setNewTray]       = useState("");
  const [importMsg,     setImportMsg]     = useState("");

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [showNotifs,    setShowNotifs]    = useState(false);
  const unreadCount = notifications.filter((n) => !n.read && n.for === u).length;

  // ── Business Logic ────────────────────────────────────────────────────────
  const gs = (id) => surgeons.find((s) => s.id === id);

  const upCase = (id, fn) => setCases((p) => p.map((c) => c.id === id ? fn(c) : c));
  const toggleSet  = (cid, sn) => upCase(cid, (c) => ({ ...c, setChecks: { ...c.setChecks, [sn]: { ...c.setChecks[sn], confirmed: !c.setChecks?.[sn]?.confirmed } } }));
  const togRet     = (cid) => upCase(cid, (c) => ({ ...c, returned: !c.returned }));
  const asgCov     = (cid, v) => upCase(cid, (c) => ({ ...c, coverageAssignee: v }));
  const asgSet     = (cid, sn, assignee) => upCase(cid, (c) => ({ ...c, setChecks: { ...c.setChecks, [sn]: { ...c.setChecks[sn], assignee } } }));
  const addImp     = () => { if (!newImplant.trim() || !cases.find((c) => c.id === selCaseId)) return; upCase(selCaseId, (c) => ({ ...c, implants: [...c.implants, newImplant.trim()] })); setNewImplant(""); };
  const remImp     = (cid, i) => upCase(cid, (c) => ({ ...c, implants: c.implants.filter((_, j) => j !== i) }));

  const assignSetAndTask = (cid, sn, assignee) => {
    asgSet(cid, sn, assignee);
    if (!assignee) return;
    const c = cases.find((x) => x.id === cid);
    if (!c) return;
    const surg    = gs(c.surgeonId);
    const dateStr = c.date instanceof Date ? c.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : c.date;
    const title   = sn + " — " + (surg?.name || "Case") + " (" + dateStr + ")";
    const exists  = tasks.find((t) => t.caseId === cid && t.setName === sn);
    if (!exists) setTasks((p) => [...p, { id: Date.now() + Math.random(), title, assignee, priority: "medium", due: "", done: false, caseId: cid, setName: sn, notes: "Confirm set is pulled, packed, and ready for case." }]);
    else setTasks((p) => p.map((t) => t.caseId === cid && t.setName === sn ? { ...t, assignee } : t));
  };

  const assignCoverageAndTask = (cid, assignee) => {
    asgCov(cid, assignee);
    if (!assignee) return;
    const c = cases.find((x) => x.id === cid);
    if (!c) return;
    const surg    = gs(c.surgeonId);
    const dateStr = c.date instanceof Date ? c.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : c.date;
    const title   = "Coverage — " + (surg?.name || "Case") + " (" + dateStr + ")";
    const exists  = tasks.find((t) => t.caseId === cid && t.setName === "__coverage__");
    if (!exists) setTasks((p) => [...p, { id: Date.now() + Math.random(), title, assignee, priority: "high", due: "", done: false, caseId: cid, setName: "__coverage__", notes: "Primary coverage for " + c.procedure + " at " + c.facility + "." }]);
    else setTasks((p) => p.map((t) => t.caseId === cid && t.setName === "__coverage__" ? { ...t, assignee } : t));
  };

  const syncAssetToLibrary = (name) => {
    if (!name || !name.trim()) return;
    setAssets((p) => {
      if (p.find((a) => a.name === name.trim())) return p;
      return [...p, { id: "ast-" + Date.now() + Math.random(), barcodeId: null, name: name.trim(), setType: name.trim(), locationId: null, history: [] }];
    });
  };

  const importExcel = async (file) => {
    try {
      const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs");
      const buf  = await file.arrayBuffer();
      const wb   = XLSX.read(buf);
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const names = rows.flat().map((v) => String(v || "").trim()).filter((v) => v.length > 0 && !["set name","name","sets","instrument set","set"].includes(v.toLowerCase()));
      if (!names.length) { setImportMsg("No set names found."); return; }
      setAssets((prev) => {
        const existing = new Set(prev.map((a) => a.name));
        const newOnes  = names.filter((n) => !existing.has(n));
        const newAssets = newOnes.map((n) => ({ id: "ast-" + Date.now() + Math.random(), barcodeId: null, name: n, locationId: null, history: [] }));
        setImportMsg("Imported " + names.length + " rows, " + newOnes.length + " new sets added.");
        setTimeout(() => setImportMsg(""), 4000);
        return [...prev, ...newAssets];
      });
    } catch (e) { setImportMsg("Error reading file — make sure it's a valid .xlsx"); }
  };

  /** Auto-confirms case set requirements when assets are scanned into a facility. */
  const applyAutoConfirms = (updatedAssets, moves, newAssetsList, currentCases) => {
    const confirmations = [];
    const queuedAssetIds = new Set();
    const queuedSlots    = new Set();
    const tryConfirm = (asset) => {
      if (queuedAssetIds.has(asset.id)) return;
      const loc     = locById(asset.locationId, FACS);
      if (!loc.facility) return;
      const setType  = asset.setType || asset.name;
      const facility = loc.facility;
      const match = [...currentCases]
        .filter((c) => c.facility === facility && c.sets.includes(setType) && !c.setChecks?.[setType]?.confirmed && (c.date >= TODAY || sameDay(c.date, TODAY)) && !queuedSlots.has(c.id + "|" + setType) && !Object.values(c.setChecks || {}).some((sc) => sc.filledBy === asset.id))
        .sort((a, b) => a.date - b.date)[0];
      if (!match) return;
      const surg    = surgeons.find((s) => s.id === match.surgeonId);
      const dateStr = match.date instanceof Date ? match.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : match.date;
      const serial  = asset.barcodeId ? "(" + asset.barcodeId + ") " : "";
      const notif   = { id: Date.now() + Math.random(), message: setType + " " + serial + "scanned into " + facility + " — auto-confirmed for " + (surg?.name || "case") + " on " + dateStr, caseId: match.id, for: match.coverageAssignee, date: new Date(), read: false };
      queuedAssetIds.add(asset.id);
      queuedSlots.add(match.id + "|" + setType);
      confirmations.push({ caseId: match.id, setType, assetId: asset.id, serial: asset.barcodeId, notif });
    };
    moves.forEach(({ assetId, toLocId }) => { const asset = updatedAssets.find((a) => a.id === assetId); if (asset) tryConfirm({ ...asset, locationId: toLocId }); });
    newAssetsList.forEach((a) => { if (a.locationId) tryConfirm(a); });
    if (!confirmations.length) return;
    setCases((prev) => prev.map((c) => { const hits = confirmations.filter((d) => d.caseId === c.id); if (!hits.length) return c; const newChecks = { ...c.setChecks }; hits.forEach((h) => { newChecks[h.setType] = { ...newChecks[h.setType], confirmed: true, filledBy: h.assetId, serial: h.serial }; }); return { ...c, setChecks: newChecks }; }));
    setNotifications((prev) => [...confirmations.map((d) => d.notif), ...prev]);
    setTasks((prev) => prev.map((t) => { const hit = confirmations.find((d) => d.caseId === t.caseId && t.setName === d.setType); return hit ? { ...t, done: true } : t; }));
  };

  // Modal save handlers
  const saveSurg   = (f) => { if (surgeons.find((s) => s.id === f.id)) setSurgeons((p) => p.map((s) => s.id === f.id ? f : s)); else { setSurgeons((p) => [...p, f]); setSelSurgId(f.id); } setShowAddSurg(false); setEditSurgId(null); };
  const saveTpl    = (f) => { if (templates.find((t) => t.id === f.id)) setTemplates((p) => p.map((t) => t.id === f.id ? f : t)); else setTemplates((p) => [...p, f]); setShowAddTpl(false); setEditTplId(null); };
  const savePref   = (tid, pf) => { const tpl = templates.find((t) => t.id === tid); setSurgeons((p) => p.map((s) => s.id === selSurgId ? { ...s, procedurePrefs: { ...s.procedurePrefs, [tid]: { ...pf, name: tpl?.name || s.procedurePrefs[tid]?.name || tid } } } : s)); setEditPrefKey(null); };
  const saveTask   = (f) => { if (tasks.find((t) => t.id === f.id)) setTasks((p) => p.map((t) => t.id === f.id ? f : t)); else setTasks((p) => [...p, f]); setShowAddTask(false); setEditTask(null); };
  const saveLoaner = (f) => {
    if (loaners.find((l) => l.id === f.id)) setLoaners((p) => p.map((l) => l.id === f.id ? f : l)); else setLoaners((p) => [...p, f]);
    if (f.assignee) {
      const taskTitle = "Loaner: " + f.setName + " — " + f.hospital;
      const exists    = tasks.find((t) => t.loanerRef === f.id);
      if (!exists) setTasks((p) => [...p, { id: Date.now(), title: taskTitle, assignee: f.assignee, priority: "medium", due: f.returnedDate || "", done: false, notes: "Status: " + f.status, loanerRef: f.id }]);
      else setTasks((p) => p.map((t) => t.loanerRef === f.id ? { ...t, assignee: f.assignee, title: taskTitle, done: f.status === "Returned" ? true : t.done } : t));
    }
    setShowAddLoaner(false); setEditLoaner(null);
  };

  const addTrayPhoto = (tn, file) => { const reader = new FileReader(); reader.onload = (e) => setTrayPhotos((p) => ({ ...p, [tn]: e.target.result })); reader.readAsDataURL(file); };
  const addPrefPhoto = (surgId, tid, file) => { const reader = new FileReader(); reader.onload = (e) => { const key = surgId + "-" + tid; setPrefPhotos((p) => ({ ...p, [key]: [...(p[key] || []), { name: file.name, url: e.target.result }] })); }; reader.readAsDataURL(file); };
  const remPrefPhoto = (surgId, tid, i) => { const key = surgId + "-" + tid; setPrefPhotos((p) => ({ ...p, [key]: (p[key] || []).filter((_, j) => j !== i) })); };

  // Derived home-tab data
  const myCases       = cases.filter((c) => c.coverageAssignee === u);
  const tomorrowCases = myCases.filter((c) => { const t = new Date(TODAY); t.setDate(t.getDate() + 1); return sameDay(c.date, t); });
  const todayCases    = myCases.filter((c) => sameDay(c.date, TODAY));
  const myOpenTasks   = tasks.filter((t) => t.assignee === u && !t.done);
  const myHighTasks   = myOpenTasks.filter((t) => t.priority === "high");
  const mySets        = cases.flatMap((c) => c.sets.filter((sn) => c.setChecks?.[sn]?.assignee === u && !c.setChecks[sn].confirmed).map((sn) => ({ sn, caseId: c.id, surgeon: gs(c.surgeonId)?.name, date: c.date })));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Palatino Linotype',serif", background: "#0d0d14", minHeight: "100dvh", color: "#ddd8cc", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ background: "#0d0d14", borderBottom: "1px solid #1e1e2e", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 48, flexShrink: 0 }}>
        <span onClick={() => setTab("home")} style={{ fontSize: 11, color: "#34a876", letterSpacing: "3px", textTransform: "uppercase", fontWeight: 700, cursor: "pointer" }}>Territory Ops</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {tab === "schedule"  && <Btn small color="#4a9eff"             onClick={() => setShowCaseModal(true)}>+ Case</Btn>}
          {tab === "tasks"     && <Btn small color="#e0a020" text="#0d0d14" onClick={() => setShowAddTask(true)}>+ Task</Btn>}
          {tab === "loaners"   && <Btn small color="#a060e0"             onClick={() => setShowAddLoaner(true)}>+ Loaner</Btn>}
          {tab === "inventory" && <><Btn small color="#34a876" onClick={() => setShowScanMove(true)}>⬡ Scan</Btn><Btn small color="#e0a020" text="#0d0d14" onClick={() => setShowBulkScan(true)} style={{ marginLeft: 6 }}>⬡⬡ Bulk</Btn></>}
          {/* Notification bell */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowNotifs((x) => !x)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px", color: unreadCount > 0 ? "#34a876" : "#444", fontSize: 18, lineHeight: 1 }}>🔔</button>
            {unreadCount > 0 && <div style={{ position: "absolute", top: 0, right: 0, width: 16, height: 16, borderRadius: "50%", background: "#e05060", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount}</div>}
            {showNotifs && (
              <div style={{ position: "absolute", right: 0, top: 36, width: 300, background: "#13131e", border: "1px solid #2a2a3e", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.7)", zIndex: 300, maxHeight: 400, overflowY: "auto" }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid #1e1e2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#ddd8cc", fontWeight: 700 }}>Notifications</span>
                  {notifications.filter((n) => n.for === u).length > 0 && <button onClick={() => setNotifications((p) => p.map((n) => n.for === u ? { ...n, read: true } : n))} style={{ fontSize: 10, color: "#555", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Mark all read</button>}
                </div>
                {notifications.filter((n) => n.for === u).length === 0 && <div style={{ padding: "20px", textAlign: "center", fontSize: 12, color: "#444" }}>No notifications</div>}
                {notifications.filter((n) => n.for === u).map((n) => (
                  <div key={n.id} onClick={() => { setNotifications((p) => p.map((x) => x.id === n.id ? { ...x, read: true } : x)); if (n.caseId) { setSelCaseId(n.caseId); setTab("schedule"); } setShowNotifs(false); }} style={{ padding: "10px 14px", borderBottom: "1px solid #161620", cursor: "pointer", background: n.read ? "transparent" : "#0d1a0d", display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: n.read ? "#333" : "#34a876", flexShrink: 0, marginTop: 4 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: n.read ? "#555" : "#ddd8cc", lineHeight: 1.5 }}>{n.message}</div>
                      <div style={{ fontSize: 9, color: "#444", marginTop: 3 }}>{n.date instanceof Date ? n.date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Dot id={u} size={30} />
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: "#0d0d14", borderBottom: "1px solid #1e1e2e", display: "flex", flexShrink: 0, overflowX: "auto" }}>
        {[["schedule","📅","Schedule"],["surgeons","👤","Surgeons"],["tasks","✓","Tasks"],["loaners","🔄","Loaners"],["inventory","📦","Inventory"]].map(([id, icon, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: isMobile ? "8px 4px" : "12px 8px", background: "transparent", border: "none", borderBottom: "3px solid " + (tab === id ? "#4a9eff" : "transparent"), color: tab === id ? "#ddd8cc" : "#555", fontSize: isMobile ? 10 : 13, fontWeight: tab === id ? 700 : 500, cursor: "pointer", fontFamily: "inherit", minWidth: isMobile ? 56 : undefined, display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", justifyContent: "center", gap: isMobile ? 2 : 0 }}>
            {isMobile && <span style={{ fontSize: 14 }}>{icon}</span>}
            <span>{label}{id === "tasks" && myOpenCount > 0 && <span style={{ marginLeft: 4, background: "#e05060", color: "#fff", fontSize: 9, borderRadius: 20, padding: "1px 5px", fontWeight: 700, verticalAlign: "middle" }}>{myOpenCount}</span>}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>
        {tab === "home" && (
          <HomeTab u={u} me={me} TODAY={TODAY} tomorrowCases={tomorrowCases} todayCases={todayCases} mySets={mySets} myHighTasks={myHighTasks} gs={gs} toggleSet={toggleSet} setSelCaseId={setSelCaseId} setTab={setTab} onLogout={onLogout} />
        )}
        {tab === "schedule" && (
          <ScheduleTab u={u} isMobile={isMobile} cases={cases} setCases={setCases} surgeons={surgeons} allTrays={allTrays} tasks={tasks} setTasks={setTasks} notifications={notifications} setNotifications={setNotifications} gs={gs} upCase={upCase} toggleSet={toggleSet} togRet={togRet} assignSetAndTask={assignSetAndTask} assignCoverageAndTask={assignCoverageAndTask} addImp={addImp} remImp={remImp} selCaseId={selCaseId} setSelCaseId={setSelCaseId} weekAnchor={weekAnchor} setWeekAnchor={setWeekAnchor} schedFilter={schedFilter} setSchedFilter={setSchedFilter} newImplant={newImplant} setNewImplant={setNewImplant} showCaseModal={showCaseModal} setShowCaseModal={setShowCaseModal} setNewCaseDate={setNewCaseDate} TODAY={TODAY} week={week} weekCases={weekCases} upcoming={upcoming} schedCases={schedCases} />
        )}
        {tab === "surgeons" && (
          <SurgeonsTab isMobile={isMobile} surgeons={surgeons} setSurgeons={setSurgeons} templates={templates} setTemplates={setTemplates} allTrays={allTrays} trayPhotos={trayPhotos} prefPhotos={prefPhotos} setPrefPhotos={setPrefPhotos} addTrayPhoto={addTrayPhoto} addPrefPhoto={addPrefPhoto} remPrefPhoto={remPrefPhoto} setShowAddSurg={setShowAddSurg} setEditSurgId={setEditSurgId} setShowAddTpl={setShowAddTpl} setEditTplId={setEditTplId} setEditPrefKey={setEditPrefKey} setTab={setTab} selSurgId={selSurgId} setSelSurgId={setSelSurgId} />
        )}
        {tab === "tasks" && (
          <TasksTab u={u} tasks={tasks} setTasks={setTasks} taskFilter={taskFilter} setTaskFilter={setTaskFilter} taskOwner={taskOwner} setTaskOwner={setTaskOwner} filteredTasks={filteredTasks} setEditTask={setEditTask} />
        )}
        {tab === "loaners" && (
          <LoanersTab loaners={loaners} setLoaners={setLoaners} setShowAddLoaner={setShowAddLoaner} setEditLoaner={setEditLoaner} />
        )}
        {tab === "inventory" && (
          <InventoryTab u={u} isMobile={isMobile} assets={assets} setAssets={setAssets} invFilter={invFilter} setInvFilter={setInvFilter} invSearch={invSearch} setInvSearch={setInvSearch} invTab={invTab} setInvTab={setInvTab} selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset} setShowScanMove={setShowScanMove} setShowBulkScan={setShowBulkScan} newTray={newTray} setNewTray={setNewTray} importMsg={importMsg} setImportMsg={setImportMsg} syncAssetToLibrary={syncAssetToLibrary} importExcel={importExcel} />
        )}
      </div>

      {/* Modals */}
      {showCaseModal && <CaseModal surgeons={surgeons} allTrays={allTrays} currentUser={u} initialDate={newCaseDate} onSave={(c) => { setCases((p) => [...p, c]); setSelCaseId(c.id); setShowCaseModal(false); setNewCaseDate(null); }} onClose={() => { setShowCaseModal(false); setNewCaseDate(null); }} />}
      {showAddSurg  && <SurgModal surg={null} onSave={saveSurg} onClose={() => setShowAddSurg(false)} />}
      {editSurgId   && <SurgModal surg={surgeons.find((s) => s.id === editSurgId)} onSave={saveSurg} onClose={() => setEditSurgId(null)} />}
      {editPrefKey && selSurgId && (() => { const selSurg = surgeons.find((s) => s.id === selSurgId); return selSurg ? <PrefModal surg={selSurg} templateId={editPrefKey} templates={templates} allTrays={allTrays} prefPhotos={prefPhotos} setPrefPhotos={setPrefPhotos} onSave={savePref} onClose={() => setEditPrefKey(null)} /> : null; })()}
      {showAddTpl && <TplModal tpl={null} allTrays={allTrays} onSave={saveTpl} onClose={() => setShowAddTpl(false)} />}
      {editTplId  && <TplModal tpl={templates.find((t) => t.id === editTplId)} allTrays={allTrays} onSave={saveTpl} onClose={() => setEditTplId(null)} />}
      {showAddTask && <TaskModal task={null} cases={cases} surgeons={surgeons} currentUser={u} onSave={saveTask} onClose={() => setShowAddTask(false)} />}
      {editTask    && <TaskModal task={editTask} cases={cases} surgeons={surgeons} currentUser={u} onSave={saveTask} onClose={() => setEditTask(null)} />}
      {(showAddLoaner || editLoaner) && <LoanerModal loaner={editLoaner} currentUser={u} onSave={saveLoaner} onClose={() => { setShowAddLoaner(false); setEditLoaner(null); }} />}
      {showBulkScan && (
        <BulkScanModal currentUser={u} assets={assets} allLoc={ALL_LOC(FACS)} onComplete={(moves, newAssets) => {
          let updatedAssets = [...assets];
          newAssets.forEach((a) => { if (!updatedAssets.find((x) => x.barcodeId === a.barcodeId)) updatedAssets = [...updatedAssets, a]; });
          moves.forEach(({ assetId, toLocId, by }) => { updatedAssets = updatedAssets.map((a) => a.id !== assetId ? a : { ...a, locationId: toLocId, history: [{ date: new Date(), from: a.locationId, to: toLocId, by }, ...(a.history || [])] }); });
          setAssets(updatedAssets);
          applyAutoConfirms(updatedAssets, moves, newAssets, cases);
          setShowBulkScan(false);
        }} onClose={() => setShowBulkScan(false)} />
      )}
      {showScanMove !== false && (() => {
        const assetForMove = showScanMove?.asset || null;
        return (
          <ScanMoveModal
            currentUser={u} assets={assets} allLoc={ALL_LOC(FACS)} allTrays={allTrays} initialAsset={assetForMove}
            onRegister={(barcodeId, setType, locId, by, photos) => {
              const newA = { id: "ast-" + Date.now(), barcodeId, name: setType + (barcodeId ? " — " + barcodeId : ""), setType, locationId: locId, photos: photos || [], history: [{ date: new Date(), from: null, to: locId, by }] };
              setAssets((p) => [...p, newA]);
              applyAutoConfirms([...assets, newA], [], [newA], cases);
              setSelectedAsset(newA);
            }}
            onMove={(assetId, toLocId, by) => {
              let movedAsset = null;
              setAssets((p) => p.map((a) => { if (a.id !== assetId) return a; movedAsset = { ...a, locationId: toLocId, history: [{ date: new Date(), from: a.locationId, to: toLocId, by }, ...(a.history || [])] }; return movedAsset; }));
              if (movedAsset) setTimeout(() => applyAutoConfirms([...assets.map((a) => a.id === assetId ? { ...a, locationId: toLocId } : a)], [{ assetId, toLocId, by }], [], cases), 0);
            }}
            onClose={() => setShowScanMove(false)}
          />
        );
      })()}
    </div>
  );
}
