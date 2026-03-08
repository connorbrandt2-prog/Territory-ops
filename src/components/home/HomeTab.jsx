// ─── Home / Dashboard Tab ─────────────────────────────────────────────────────
import React from "react";
import { Card, SH, Bdg, Btn, Dot } from "../ui";
import { ST, SC } from "../../constants/theme";
import { fmtD } from "../../utils/dates";
import { cSt } from "../../utils/caseUtils";

export default function HomeTab({ u, me, TODAY, tomorrowCases, todayCases, mySets, myHighTasks, gs, toggleSet, setSelCaseId, setTab, onLogout }) {
  return (
    <div style={{ padding: "16px 16px 0" }}>
      {/* Greeting */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 10, color: "#444", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 3 }}>{TODAY.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#ddd8cc" }}>Good morning, {me.name.split(" ")[0]}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <Dot id={u} size={44} />
          <button onClick={onLogout} style={{ fontSize: 9, color: "#333", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", letterSpacing: "1px" }}>SIGN OUT</button>
        </div>
      </div>

      {/* Tomorrow's Cases */}
      <SH color="#34a876" label="Tomorrow's Cases — Prep Now" count={tomorrowCases.length} />
      {tomorrowCases.length === 0
        ? <Card style={{ marginBottom: 18 }}><div style={{ color: "#333", fontSize: 12, textAlign: "center", padding: "8px 0" }}>No cases assigned tomorrow</div></Card>
        : tomorrowCases.map((c) => {
            const s  = gs(c.surgeonId);
            const st = ST[cSt(c)];
            return (
              <div key={c.id} onClick={() => { setSelCaseId(c.id); setTab("schedule"); }} style={{ background: "#111119", border: "1px solid " + st.bar + "55", borderLeft: "3px solid " + st.bar, borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#ddd8cc" }}>{s?.name}</div>
                    <div style={{ fontSize: 11, color: SC[s?.specialty] || "#888", marginTop: 2 }}>{c.facility}</div>
                  </div>
                  <Bdg bg={st.badge} color={st.bt}>{st.l}</Bdg>
                </div>
                {c.sets.map((sn, i) => {
                  const sc = c.setChecks?.[sn] || {};
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 0", borderTop: "1px solid #161620" }}>
                      <div onClick={(e) => { e.stopPropagation(); toggleSet(c.id, sn); }} style={{ width: 16, height: 16, borderRadius: 4, border: "2px solid " + (sc.confirmed ? "#34a876" : "#2a2a3e"), background: sc.confirmed ? "#34a876" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", cursor: "pointer", flexShrink: 0 }}>{sc.confirmed ? "✓" : ""}</div>
                      <span style={{ fontSize: 11, color: sc.confirmed ? "#7fe0aa" : "#aaa", textDecoration: sc.confirmed ? "line-through" : "none" }}>{sn}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}

      {/* Today's Cases */}
      {todayCases.length > 0 && <>
        <SH color="#9090c0" label="Today's Cases" count={todayCases.length} />
        {todayCases.map((c) => { const s = gs(c.surgeonId); const st = ST[cSt(c)]; return (<div key={c.id} onClick={() => { setSelCaseId(c.id); setTab("schedule"); }} style={{ background: "#111119", border: "1px solid #1e1e2e", borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontSize: 13, fontWeight: 700, color: "#ddd8cc" }}>{s?.name}</div><div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{c.facility}</div></div><Bdg bg={st.badge} color={st.bt}>{st.l}</Bdg></div></div>); })}
      </>}

      {/* Sets Needing Confirmation */}
      {mySets.length > 0 && <>
        <SH color="#e0a020" label="Sets Needing Confirmation" count={mySets.length} />
        <Card accent="#e0a02033" style={{ marginBottom: 18 }}>
          {mySets.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 0", borderBottom: i < mySets.length - 1 ? "1px solid #161620" : "none" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#e0a020", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "#ddd8cc" }}>{item.sn}</div>
                <div style={{ fontSize: 10, color: "#555" }}>{item.surgeon} — {fmtD(item.date)}</div>
              </div>
              <button onClick={() => toggleSet(item.caseId, item.sn)} style={{ fontSize: 10, color: "#34a876", background: "#1a3d2b", border: "1px solid #34a87655", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>Confirm</button>
            </div>
          ))}
        </Card>
      </>}

      {/* High Priority Tasks */}
      {myHighTasks.length > 0 && <>
        <SH color="#e05060" label="High Priority Tasks" count={myHighTasks.length} />
        {myHighTasks.map((task) => (
          <div key={task.id} style={{ background: "#111119", border: "1px solid #3d1520", borderLeft: "3px solid #e05060", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: "#ddd8cc", fontWeight: 600 }}>{task.title}</div>
            {task.due && task.due.length === 10 && <div style={{ fontSize: 10, color: "#e05060", marginTop: 4 }}>Due {new Date(task.due + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>}
          </div>
        ))}
      </>}

      {tomorrowCases.length === 0 && mySets.length === 0 && myHighTasks.length === 0 && todayCases.length === 0 && (
        <Card><div style={{ color: "#444", fontSize: 13, textAlign: "center", padding: "20px 0" }}>You're all caught up!</div></Card>
      )}
    </div>
  );
}
