// ─── Add / Edit Loaner Modal ──────────────────────────────────────────────────
import React, { useState } from "react";
import { MW, MT, FL, F, Inp, Sel, TA, Btn, AcPick } from "../ui";
import { FACS } from "../../constants/facilities";
import { runOCR } from "../../utils/ocr";
import { extractTracking } from "../../utils/ocr";

export default function LoanerModal({ loaner, currentUser, onSave, onClose }) {
  const [f, sf] = useState(loaner || { id: Date.now(), setName: "", serial: "", hospital: FACS[0], status: "Received", receivedDate: "", returnedDate: "", assignee: currentUser, notes: "", fedex: "", photo: null });
  const [scanErr,         setScanErr]         = useState("");
  const [scanLoading,     setScanLoading]     = useState(false);
  const [pendingNums,     setPendingNums]     = useState([]);
  const [trackScanLoading,setTrackScanLoading]= useState(false);
  const [trackScanErr,    setTrackScanErr]    = useState("");
  const [trackPending,    setTrackPending]    = useState([]);
  const serialInputRef = React.useRef(null);
  const trackInputRef  = React.useRef(null);

  const processSerialPhoto = async (file) => {
    if (!file) return;
    setScanErr(""); setScanLoading(true); setPendingNums([]);
    try {
      const nums = await runOCR(file);
      if (nums && nums.length > 0) {
        if (nums.length === 1) { sf((p) => ({ ...p, serial: nums[0], setName: p.setName || "Set " + nums[0] })); setScanLoading(false); }
        else { setPendingNums(nums); setScanLoading(false); }
      } else { setScanErr("No numbers found — enter manually."); setScanLoading(false); }
    } catch (e) { setScanErr("Error: " + e.message); setScanLoading(false); }
  };

  const processTrackPhoto = async (file) => {
    if (!file) return;
    setTrackScanErr(""); setTrackScanLoading(true); setTrackPending([]);
    try {
      if (!window.Tesseract) { setTrackScanErr("OCR not loaded."); setTrackScanLoading(false); return; }
      const url = URL.createObjectURL(file);
      const img = new Image(); img.src = url;
      await new Promise((r) => { img.onload = r; });
      const canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const worker = await window.Tesseract.createWorker("eng");
      await worker.setParameters({ tessedit_pageseg_mode: "11" });
      const { data: { text } } = await worker.recognize(canvas);
      await worker.terminate();
      const nums = [...text.replace(/[^0-9\n ]/g, " ").matchAll(/\b(\d{10,22})\b/g)].map((m) => m[1]);
      if (nums.length === 1) { sf((p) => ({ ...p, fedex: nums[0] })); setTrackScanLoading(false); }
      else if (nums.length > 1) { setTrackPending(nums); setTrackScanLoading(false); }
      else { setTrackScanErr("No tracking number found — enter manually."); setTrackScanLoading(false); }
    } catch (e) { setTrackScanErr("Error: " + e.message); setTrackScanLoading(false); }
  };

  const addPhoto = (file) => { const r = new FileReader(); r.onload = (e) => sf((p) => ({ ...p, photo: e.target.result })); r.readAsDataURL(file); };

  return (
    <MW><MT>{loaner ? "Edit Loaner" : "New Loaner"}</MT>

      {/* Serial Number */}
      <F mb={14}>
        <FL color="#34a876">Set Serial Number</FL>
        <input ref={serialInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => { processSerialPhoto(e.target.files[0]); e.target.value = ""; }} />
        {scanLoading
          ? <div style={{ height: 70, background: "#0d0d14", border: "1px solid #34a87655", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}><span style={{ fontSize: 16 }}>⏳</span><span style={{ fontSize: 12, color: "#34a876" }}>Reading serial...</span></div>
          : <div onClick={() => serialInputRef.current?.click()} style={{ height: 70, background: "#0d0d14", border: "2px dashed #34a87644", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 10, marginBottom: 8 }}><span style={{ fontSize: 24 }}>📷</span><div><div style={{ fontSize: 12, color: "#34a876", fontWeight: 700 }}>Photo the white Globus label</div><div style={{ fontSize: 10, color: "#444" }}>Or type below</div></div></div>}
        {pendingNums.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>Which number is the serial?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {pendingNums.map((n) => (<button key={n} onClick={() => { sf((p) => ({ ...p, serial: n, setName: p.setName || "Set " + n })); setPendingNums([]); }} style={{ padding: "8px 14px", background: "#1a2a1a", border: "2px solid #34a876", borderRadius: 8, color: "#34a876", fontFamily: "monospace", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>{n}</button>))}
            </div>
          </div>
        )}
        {scanErr && <div style={{ fontSize: 11, color: "#e05060", padding: "5px 10px", background: "#1a0a0a", borderRadius: 6, border: "1px solid #e0506033", marginBottom: 6 }}>{scanErr}</div>}
        {f.serial ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#34a87618", border: "1px solid #34a87644", borderRadius: 7, marginBottom: 8 }}>
            <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#34a876", fontSize: 15 }}>{f.serial}</span>
            <button onClick={() => sf((p) => ({ ...p, serial: "" }))} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#555", cursor: "pointer", fontSize: 16 }}>×</button>
          </div>
        ) : null}
        <Inp value={f.serial || ""} onChange={(e) => sf((p) => ({ ...p, serial: e.target.value }))} placeholder="Or type serial number manually..." />
      </F>

      <F><FL>Set / Instrument Name</FL><Inp value={f.setName} onChange={(e) => sf((p) => ({ ...p, setName: e.target.value }))} placeholder="e.g. MIS TLIF Set, Pedicle Screw System" /></F>
      <F><FL>Hospital</FL><Sel value={f.hospital} onChange={(e) => sf((p) => ({ ...p, hospital: e.target.value }))}>{FACS.map((x) => <option key={x}>{x}</option>)}</Sel></F>

      <F><FL>Status</FL>
        <div style={{ display: "flex", gap: 8 }}>
          {["Received", "Returned", "Borrowed"].map((s) => { const active = f.status === s; const col = s === "Received" ? "#34a876" : s === "Returned" ? "#4a9eff" : "#e0a020"; return (<button key={s} onClick={() => sf((p) => ({ ...p, status: s }))} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: "1px solid " + (active ? col : "#2a2a3e"), background: active ? col + "18" : "transparent", color: active ? col : "#555", fontSize: 12, fontWeight: active ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>{s}</button>); })}
        </div>
      </F>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <F mb={0}><FL>Received Date</FL><Inp type="date" value={f.receivedDate || ""} onChange={(e) => sf((p) => ({ ...p, receivedDate: e.target.value }))} /></F>
        {f.status === "Returned" && <F mb={0}><FL>Returned Date</FL><Inp type="date" value={f.returnedDate || ""} onChange={(e) => sf((p) => ({ ...p, returnedDate: e.target.value }))} /></F>}
      </div>

      <F mb={12}><FL>Assigned To</FL><AcPick value={f.assignee} onChange={(v) => sf((p) => ({ ...p, assignee: v || currentUser }))} /></F>
      <F mb={14}><FL>Notes</FL><TA value={f.notes} onChange={(e) => sf((p) => ({ ...p, notes: e.target.value }))} placeholder="Vendor contact, loaner details, special instructions..." /></F>

      {/* Tracking number — only when Returned */}
      {f.status === "Returned" && (
        <F mb={14}>
          <FL color="#4a9eff">Return Tracking Number</FL>
          <input ref={trackInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => { processTrackPhoto(e.target.files[0]); e.target.value = ""; }} />
          {trackScanLoading
            ? <div style={{ height: 60, background: "#0d0d14", border: "1px solid #4a9eff55", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}><span style={{ fontSize: 14 }}>⏳</span><span style={{ fontSize: 11, color: "#4a9eff" }}>Reading tracking number...</span></div>
            : <div onClick={() => trackInputRef.current?.click()} style={{ height: 60, background: "#0d0d14", border: "2px dashed #4a9eff44", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 10, marginBottom: 8 }}><span style={{ fontSize: 20 }}>📷</span><div><div style={{ fontSize: 11, color: "#4a9eff", fontWeight: 700 }}>Photo the shipping label</div><div style={{ fontSize: 10, color: "#444" }}>Or type below</div></div></div>}
          {trackPending.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>Which is the tracking number?</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {trackPending.map((n) => (<button key={n} onClick={() => { sf((p) => ({ ...p, fedex: n })); setTrackPending([]); }} style={{ padding: "6px 12px", background: "#0d1a2a", border: "2px solid #4a9eff", borderRadius: 8, color: "#4a9eff", fontFamily: "monospace", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{n}</button>))}
              </div>
            </div>
          )}
          {trackScanErr && <div style={{ fontSize: 11, color: "#e05060", padding: "5px 10px", background: "#1a0a0a", borderRadius: 6, border: "1px solid #e0506033", marginBottom: 6 }}>{trackScanErr}</div>}
          <Inp value={f.fedex || ""} onChange={(e) => sf((p) => ({ ...p, fedex: e.target.value }))} placeholder="Or enter tracking number manually..." />
        </F>
      )}

      <F mb={16}>
        <FL color="#9090c0">Shipment Photo</FL>
        {f.photo
          ? <div style={{ position: "relative", display: "inline-block" }}>
              <img src={f.photo} style={{ width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 8, border: "1px solid #2a2a3e", display: "block" }} />
              <button onClick={() => sf((p) => ({ ...p, photo: null }))} style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: "50%", background: "#e05060", border: "none", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>×</button>
            </div>
          : <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#111119", border: "1px dashed #2a2a3e", borderRadius: 8 }}>
              <span style={{ fontSize: 20 }}>📦</span>
              <div><div style={{ color: "#aaa", fontWeight: 600, fontSize: 12 }}>Attach shipment photo</div><div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>Label, packing slip, or condition on arrival</div></div>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) addPhoto(e.target.files[0]); }} />
            </label>}
      </F>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn outline color="#555" onClick={onClose}>Cancel</Btn>
        <Btn color="#a060e0" onClick={() => { if (!f.setName.trim()) return; onSave(f); }}>Save</Btn>
      </div>
    </MW>
  );
}
