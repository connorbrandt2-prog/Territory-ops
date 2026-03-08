// ─── Schedule Tab ─────────────────────────────────────────────────────────────
import React, { useState, useRef, useCallback } from "react";
import { Bdg, Btn } from "../ui";
import { ST, DAYS, MONTHS, SPEC_COLOR } from "../../constants/theme";
import { sameDay, fmtD } from "../../utils/dates";
import { cPct, cSt } from "../../utils/caseUtils";
import CaseDetail from "./CaseDetail";

export default function ScheduleTab({
  u, isMobile, cases, setCases, surgeons, allTrays, tasks, setTasks,
  notifications, setNotifications, gs,
  upCase, toggleSet, togRet, assignSetAndTask, assignCoverageAndTask, addImp, remImp,
  selCaseId, setSelCaseId, weekAnchor, setWeekAnchor, schedFilter, setSchedFilter,
  newImplant, setNewImplant, showCaseModal, setShowCaseModal, setNewCaseDate, TODAY,
  week, weekCases, upcoming, schedCases,
}) {
  const [confirmDeleteCase, setConfirmDeleteCase] = useState(false);

  const touchStartX = useRef(null);
  const shiftWeek = useCallback((dir) => {
    setWeekAnchor(prev => { const d = new Date(prev); d.setDate(d.getDate() + dir * 7); return d; });
  }, [setWeekAnchor]);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) shiftWeek(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  };
  const onWheel = (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 30) {
      e.preventDefault();
      shiftWeek(e.deltaX > 0 ? 1 : -1);
    }
  };

  const selCase = cases.find((c) => c.id === selCaseId) || null;

  const caseDetailProps = {
    selCase, gs, upCase, toggleSet, togRet, assignSetAndTask, assignCoverageAndTask,
    addImp, remImp, newImplant, setNewImplant,
    confirmDeleteCase, setConfirmDeleteCase,
    setCases, setSelCaseId, u,
  };

  // Mobile full-screen case detail
  if (isMobile && selCaseId) {
    return (
      <div style={{ padding: 12 }}>
        <button onClick={() => setSelCaseId(null)} style={{ background: "none", border: "none", color: "#4a9eff", cursor: "pointer", fontSize: 13, fontFamily: "inherit", marginBottom: 12, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>← Back to schedule</button>
        <CaseDetail {...caseDetailProps} />
      </div>
    );
  }

  return (
    <div>
      {/* Week navigation */}
      <div style={{ padding: "10px 16px 0", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => { const d = new Date(weekAnchor); d.setDate(d.getDate() - 7); setWeekAnchor(d); }} style={{ background: "#1e1e2e", border: "1px solid #2a2a3e", color: "#aaa", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 13 }}>‹</button>
        <span style={{ fontSize: 12, color: "#9090c0", fontWeight: 600 }}>{MONTHS[week[0].getMonth()]} {week[0].getDate()}–{week[6].getDate()}</span>
        <button onClick={() => { const d = new Date(weekAnchor); d.setDate(d.getDate() + 7); setWeekAnchor(d); }} style={{ background: "#1e1e2e", border: "1px solid #2a2a3e", color: "#aaa", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 13 }}>›</button>
        <button onClick={() => setWeekAnchor(TODAY)} style={{ background: "transparent", border: "1px solid #2a2a3e", color: "#555", borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontFamily: "inherit", fontSize: 10 }}>TODAY</button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {[["mine","Mine"],["all","All"]].map(([v, l]) => (
            <button key={v} onClick={() => setSchedFilter(v)} style={{ padding: "3px 10px", borderRadius: 20, border: "1px solid", borderColor: schedFilter === v ? "#4a9eff" : "#2a2a3e", background: schedFilter === v ? "#0d2040" : "transparent", color: schedFilter === v ? "#4a9eff" : "#555", fontSize: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: schedFilter === v ? 700 : 400 }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Week grid */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
        style={{ padding: "8px 16px", display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: isMobile ? 2 : 4, touchAction: "pan-y" }}
      >
        {week.map((d, i) => {
          const dc  = weekCases.filter((c) => sameDay(c.date, d));
          const isT = sameDay(d, TODAY);
          return (
            <div key={i} onClick={() => { if (dc.length > 0) setSelCaseId(dc[0].id); else { setNewCaseDate(d); setShowCaseModal(true); } }} style={{ background: isT ? "#141428" : "#111119", border: "1px solid " + (isT ? "#3a3a6e" : "#1e1e2e"), borderRadius: 8, padding: isMobile ? "4px 3px" : "6px 5px", minHeight: isMobile ? 48 : 58, cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = isT ? "#4a4a8e" : "#2a2a4e")} onMouseLeave={(e) => (e.currentTarget.style.borderColor = isT ? "#3a3a6e" : "#1e1e2e")}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 2 }}>
                <span style={{ fontSize: isMobile ? 7 : 8, color: isT ? "#9090c0" : "#333", letterSpacing: "0.5px", textTransform: "uppercase" }}>{DAYS[i]}</span>
                <span style={{ fontSize: isMobile ? 10 : 11, color: isT ? "#ddd8cc" : "#555", fontWeight: isT ? 700 : 400 }}>{d.getDate()}</span>
              </div>
              {dc.map((c) => { const st = ST[cSt(c)]; const s = gs(c.surgeonId); const isSel = selCaseId === c.id; return (<div key={c.id} onClick={() => setSelCaseId(c.id)} style={{ background: isSel ? "#1a1a32" : "#0d0d18", border: "1px solid " + (isSel ? st.bar : "#1e1e2e"), borderRadius: 4, padding: "2px 3px", marginBottom: 2, cursor: "pointer" }}><span style={{ fontSize: isMobile ? 7 : 8, color: "#bbb", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s?.name.replace("Dr. ", "")}</span>{!isMobile && c.time && <span style={{ fontSize: 7, color: "#888", display: "block" }}>{c.time}</span>}<div style={{ background: "#0a0a12", borderRadius: 2, height: 2, marginTop: 1 }}><div style={{ height: "100%", width: cPct(c) + "%", background: st.bar }} /></div></div>); })}
            </div>
          );
        })}
      </div>

      {/* Mobile: upcoming list */}
      {isMobile ? (
        <div style={{ padding: "0 12px 80px" }}>
          <div style={{ fontSize: 8, letterSpacing: "2px", color: "#444", textTransform: "uppercase", marginBottom: 8, paddingTop: 4 }}>Upcoming</div>
          {upcoming.length === 0 && <div style={{ fontSize: 12, color: "#333", fontStyle: "italic" }}>No upcoming cases</div>}
          {upcoming.map((c) => { const s = gs(c.surgeonId); const st = ST[cSt(c)]; const sc = s?.color || SPEC_COLOR[s?.specialty] || "#888"; return (<div key={c.id} onClick={() => setSelCaseId(c.id)} style={{ padding: "10px 12px", borderBottom: "1px solid #161620", cursor: "pointer", background: "#111119", borderRadius: 8, marginBottom: 6, borderLeft: "3px solid " + sc }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}><span style={{ fontSize: 13, fontWeight: 600, color: "#ddd8cc" }}>{s?.name}</span><Bdg bg={st.badge} color={st.bt} sm>{st.l}</Bdg></div><div style={{ fontSize: 11, color: "#9090c0", marginTop: 2 }}>{fmtD(c.date)}{c.time && " · " + c.time}</div><div style={{ fontSize: 10, color: "#555", marginTop: 1 }}>{c.facility} — {c.procedure}</div>{c.ctUploaded && <span style={{ fontSize: 9, color: "#4a9eff", fontWeight: 700 }}>✓ CT</span>}</div>); })}
        </div>
      ) : (
        /* Desktop: split panel */
        <div style={{ padding: "0 16px 16px", display: "flex", gap: 0, height: 340 }}>
          <div style={{ width: 160, background: "#111119", border: "1px solid #1e1e2e", borderRadius: "11px 0 0 11px", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
            <div style={{ padding: "7px 10px", borderBottom: "1px solid #1e1e2e", fontSize: 8, letterSpacing: "2px", color: "#444", textTransform: "uppercase" }}>Upcoming</div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {upcoming.map((c) => { const s = gs(c.surgeonId); const st = ST[cSt(c)]; const sc = s?.color || SPEC_COLOR[s?.specialty] || "#888"; const isSel = selCaseId === c.id; return (<div key={c.id} onClick={() => setSelCaseId(c.id)} style={{ padding: "8px 10px", borderBottom: "1px solid #161620", cursor: "pointer", background: isSel ? "#1a1a30" : "transparent", borderLeft: "3px solid " + sc }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}><span style={{ fontSize: 11, fontWeight: 600, color: "#ddd8cc" }}>{s?.name.replace("Dr. ", "Dr.")}</span><Bdg bg={st.badge} color={st.bt} sm>{st.l}</Bdg></div><div style={{ fontSize: 9, color: "#9090c0", marginTop: 1 }}>{fmtD(c.date)}</div>{c.ctUploaded && <div style={{ display: "inline-flex", alignItems: "center", gap: 3, marginTop: 3, padding: "1px 6px", background: "#0d1e33", border: "1px solid #4a9eff44", borderRadius: 4 }}><span style={{ fontSize: 8, color: "#4a9eff", fontWeight: 700 }}>✓ CT</span></div>}<div style={{ background: "#0a0a12", borderRadius: 3, height: 2, marginTop: 5 }}><div style={{ height: "100%", width: cPct(c) + "%", background: st.bar, borderRadius: 3 }} /></div></div>); })}
            </div>
          </div>
          <div style={{ flex: 1, background: "#13131e", border: "1px solid #1e1e2e", borderLeft: "none", borderRadius: "0 11px 11px 0", padding: "14px", overflowY: "auto" }}>
            <CaseDetail {...caseDetailProps} />
          </div>
        </div>
      )}
    </div>
  );
}
