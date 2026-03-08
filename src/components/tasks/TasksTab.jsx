// ─── Tasks Tab ────────────────────────────────────────────────────────────────
import React from "react";
import { Card, SH, Bdg, Dot } from "../ui";
import { PRIO } from "../../constants/theme";
import { abt } from "../../constants/accounts";

export default function TasksTab({ u, tasks, setTasks, taskFilter, setTaskFilter, taskOwner, setTaskOwner, filteredTasks, setEditTask }) {
  const coverageTasks   = filteredTasks.filter((t) => t.setName === "__coverage__");
  const schedulingTasks = filteredTasks.filter((t) => t.setName && t.setName !== "__coverage__" && !t.loanerRef);
  const loanerTasks     = filteredTasks.filter((t) => !!t.loanerRef);
  const manualTasks     = filteredTasks.filter((t) => !t.setName && !t.loanerRef);

  const TaskCard = ({ task }) => {
    const p   = PRIO[task.priority] || PRIO.medium;
    const rep = task.assignee ? abt(task.assignee) : null;
    return (
      <div style={{ background: "#111119", border: "1px solid " + (task.done ? "#1e1e2e" : p.bg), borderLeft: "3px solid " + (task.done ? "#2a2a3e" : p.c), borderRadius: 10, padding: "12px 14px", marginBottom: 6, opacity: task.done ? 0.55 : 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div onClick={() => setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, done: !t.done } : t))} style={{ width: 16, height: 16, borderRadius: 4, border: "2px solid " + (task.done ? "#34a876" : "#2a2a3e"), background: task.done ? "#34a876" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", cursor: "pointer", flexShrink: 0 }}>{task.done ? "✓" : ""}</div>
              <span style={{ fontSize: 13, color: task.done ? "#555" : "#ddd8cc", fontWeight: 600, textDecoration: task.done ? "line-through" : "none" }}>{task.title}</span>
            </div>
            {task.notes && !task.done && <div style={{ fontSize: 11, color: "#444", marginLeft: 24, marginBottom: 4, lineHeight: 1.5 }}>{task.notes}</div>}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginLeft: 24 }}>
              {!task.done && <Bdg bg={p.bg} color={p.c}>{p.l}</Bdg>}
              {task.due && task.due.length === 10 && <span style={{ fontSize: 10, color: task.done ? "#444" : "#9090c0" }}>Due {new Date(task.due + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {rep && <div title={rep.name} style={{ width: 22, height: 22, borderRadius: "50%", background: rep.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#0d0d14", fontWeight: 800, flexShrink: 0 }}>{rep.initials}</div>}
            <button onClick={() => setEditTask(task)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>edit</button>
          </div>
        </div>
      </div>
    );
  };

  const Section = ({ label, color, items, emptyHide }) => {
    if (emptyHide && !items.length) return null;
    return (
      <div style={{ marginBottom: 20 }}>
        <SH color={color} label={label} count={items.length} />
        {items.length === 0
          ? <div style={{ fontSize: 11, color: "#333", fontStyle: "italic", padding: "8px 0 4px" }}>None</div>
          : items.map((t) => <TaskCard key={t.id} task={t} />)}
      </div>
    );
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[["open","Open"],["all","All"],["done","Done"]].map(([v, l]) => (
            <button key={v} onClick={() => setTaskFilter(v)} style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid", borderColor: taskFilter === v ? "#e0a020" : "#2a2a3e", background: taskFilter === v ? "#3d2e00" : "transparent", color: taskFilter === v ? "#e0a020" : "#555", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: taskFilter === v ? 700 : 400 }}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[["mine","Mine"],["all","All"]].map(([v, l]) => (
            <button key={v} onClick={() => setTaskOwner(v)} style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid", borderColor: taskOwner === v ? "#4a9eff" : "#2a2a3e", background: taskOwner === v ? "#0d2040" : "transparent", color: taskOwner === v ? "#4a9eff" : "#555", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: taskOwner === v ? 700 : 400 }}>{l}</button>
          ))}
        </div>
      </div>
      <Section label="Case Coverage"       color="#4a9eff" items={coverageTasks}   emptyHide />
      <Section label="Scheduling — Sets"   color="#34a876" items={schedulingTasks} emptyHide />
      <Section label="Loaners"             color="#a060e0" items={loanerTasks}     emptyHide />
      <Section label="General Tasks"       color="#e0a020" items={manualTasks}     emptyHide />
      {filteredTasks.length === 0 && <div style={{ color: "#333", textAlign: "center", padding: 40, fontSize: 13 }}>No tasks found</div>}
    </div>
  );
}
