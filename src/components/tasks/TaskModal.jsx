// ─── Add / Edit Task Modal ────────────────────────────────────────────────────
import React, { useState } from "react";
import { MW, MT, FL, F, Inp, Sel, TA, Btn, AcPick } from "../ui";

export default function TaskModal({ task, cases, surgeons, currentUser, onSave, onClose }) {
  const [f, sf] = useState(
    task
      ? { ...task }
      : { id: Date.now(), title: "", assignee: currentUser, priority: "medium", due: "", done: false, caseId: null, notes: "" }
  );

  return (
    <MW><MT>{task ? "Edit Task" : "New Task"}</MT>
      <F><FL>Task Title</FL><Inp value={f.title} onChange={(e) => sf((p) => ({ ...p, title: e.target.value }))} /></F>
      <F mb={12}><FL>Assign To</FL><AcPick value={f.assignee} onChange={(v) => sf((p) => ({ ...p, assignee: v || currentUser }))} /></F>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 11 }}>
        <F mb={0}><FL>Priority</FL>
          <Sel value={f.priority} onChange={(e) => sf((p) => ({ ...p, priority: e.target.value }))}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Sel>
        </F>
        <F mb={0}><FL>Due Date</FL><Inp type="date" value={f.due} onChange={(e) => sf((p) => ({ ...p, due: e.target.value }))} /></F>
      </div>
      <F mb={16}><FL>Notes</FL><TA value={f.notes} onChange={(e) => sf((p) => ({ ...p, notes: e.target.value }))} /></F>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn outline color="#555" onClick={onClose}>Cancel</Btn>
        <Btn color="#e0a020" text="#0d0d14" onClick={() => f.title.trim() && onSave(f)}>Save Task</Btn>
      </div>
    </MW>
  );
}
