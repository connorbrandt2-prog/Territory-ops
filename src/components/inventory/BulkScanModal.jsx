// ─── Bulk Scan & Move Modal ───────────────────────────────────────────────────
//
// Allows scanning multiple instrument sets at once and moving them all to a
// single destination location. Uses OCR (Tesseract.js via CDN) to read barcodes.
//
// TODO (iOS): Replace the camera file input with react-native-vision-camera.
// The runOCR and extractSerial logic in utils/ocr.js stays the same.

import React, { useState } from "react";
import { MW, MT, FL, F, Btn } from "../ui";
import { runOCR } from "../../utils/ocr";

export default function BulkScanModal({ currentUser, assets, allLoc, onComplete, onClose }) {
  const [step,        setStep]        = useState("location"); // location | scan | confirm
  const [destLocId,   setDestLocId]   = useState(allLoc[0]?.id || "");
  const [scannedList, setScannedList] = useState([]);
  const [scanning,    setScanning]    = useState(false);
  const [scanErr,     setScanErr]     = useState("");
  const [lastScan,    setLastScan]    = useState("");
  const [manualId,    setManualId]    = useState("");
  const [locSearch,   setLocSearch]   = useState("");
  const [pendingNums, setPendingNums] = useState([]);
  const photoInputRef = React.useRef(null);

  const processPhoto = async (file) => {
    if (!file) return;
    setScanErr(""); setScanning(true); setPendingNums([]);
    try {
      const nums = await runOCR(file);
      if (nums && nums.length > 0) {
        if (nums.length === 1) { addScannedItem(nums[0]); setLastScan("✓ " + nums[0]); setScanning(false); }
        else { setPendingNums(nums); setScanning(false); }
      } else { setScanErr("No numbers found — try again or enter manually."); setScanning(false); }
    } catch (e) { setScanErr("Error: " + e.message); setScanning(false); }
  };

  const addScannedItem = (id) => {
    const trimmed = id.trim();
    if (!trimmed) return;
    if (scannedList.find((s) => s.barcodeId === trimmed)) { setLastScan("⚠️ Already scanned"); return; }
    const existing = assets.find((a) => a.barcodeId === trimmed);
    const item = { barcodeId: trimmed, name: existing?.name || "Set " + trimmed, assetId: existing?.id || null, isNew: !existing, currentLoc: existing?.locationId || null };
    setScannedList((p) => [...p, item]);
    setLastScan("✓ " + item.name);
    setManualId("");
  };

  const removeItem = (barcodeId) => setScannedList((p) => p.filter((s) => s.barcodeId !== barcodeId));

  const destLoc     = allLoc.find((l) => l.id === destLocId);
  const filteredLoc = locSearch ? allLoc.filter((l) => l.label.toLowerCase().includes(locSearch.toLowerCase())) : allLoc;

  const handleConfirm = () => {
    const moves     = scannedList.filter((s) => !s.isNew && s.assetId).map((s) => ({ assetId: s.assetId, toLocId: destLocId, by: currentUser }));
    const newAssets = scannedList.filter((s) => s.isNew).map((s) => ({ id: "ast-" + Date.now() + Math.random(), barcodeId: s.barcodeId, name: s.name, locationId: destLocId, history: [{ date: new Date(), from: null, to: destLocId, by: currentUser }] }));
    onComplete(moves, newAssets);
  };

  return (
    <MW>
      <MT>Bulk Scan & Move</MT>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 0, marginBottom: 18, borderRadius: 8, overflow: "hidden", border: "1px solid #2a2a3e" }}>
        {[["location", "1. Destination"], ["scan", "2. Scan Sets"], ["confirm", "3. Confirm"]].map(([s, l], i) => (
          <div key={s} style={{ flex: 1, padding: "7px 4px", textAlign: "center", fontSize: 10, fontWeight: step === s ? 700 : 400, background: step === s ? "#1a3d2b" : "transparent", color: step === s ? "#34a876" : "#444", borderRight: i < 2 ? "1px solid #2a2a3e" : "none" }}>{l}</div>
        ))}
      </div>

      {/* STEP 1 — Pick destination */}
      {step === "location" && <>
        <F mb={10}><FL>Search location</FL>
          <input value={locSearch} onChange={(e) => setLocSearch(e.target.value)} placeholder="Type to filter..." style={{ width: "100%", padding: "8px 11px", background: "#0d0d14", border: "1px solid #2a2a3e", borderRadius: 7, color: "#ddd8cc", fontFamily: "inherit", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </F>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 240, overflowY: "auto", marginBottom: 16 }}>
          {filteredLoc.map((l) => {
            const active = destLocId === l.id;
            return (
              <button key={l.id} onClick={() => setDestLocId(l.id)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid " + (active ? l.color : "#2a2a3e"), background: active ? l.color + "22" : "#0d0d14", color: active ? l.color : "#666", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: active ? 700 : 400, display: "flex", alignItems: "center", gap: 6 }}>
                <span>{l.icon}</span><span>{l.label}</span>
              </button>
            );
          })}
        </div>
        {destLoc && <div style={{ padding: "8px 12px", background: destLoc.color + "18", border: "1px solid " + destLoc.color + "44", borderRadius: 7, marginBottom: 14, fontSize: 12, color: destLoc.color, fontWeight: 700 }}>Destination: {destLoc.icon} {destLoc.label}</div>}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn outline color="#555" onClick={onClose}>Cancel</Btn>
          <Btn color="#34a876" onClick={() => setStep("scan")}>Next: Scan Sets →</Btn>
        </div>
      </>}

      {/* STEP 2 — Scan sets */}
      {step === "scan" && <>
        <div style={{ padding: "6px 10px", background: destLoc?.color + "18", border: "1px solid " + destLoc?.color + "44", borderRadius: 6, marginBottom: 8, fontSize: 11, color: destLoc?.color, fontWeight: 700 }}>→ {destLoc?.icon} {destLoc?.label}</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <Btn outline color="#555" onClick={() => setStep("location")}>← Back</Btn>
          <Btn color="#34a876" onClick={() => setStep("confirm")} style={{ flex: 1, opacity: scannedList.length === 0 ? 0.4 : 1 }}>Review {scannedList.length} Set{scannedList.length !== 1 ? "s" : ""} →</Btn>
        </div>
        <input ref={photoInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => { processPhoto(e.target.files[0]); e.target.value = ""; }} />
        {scanning
          ? <div style={{ height: 60, background: "#0d0d14", border: "1px solid #34a87655", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}><span style={{ fontSize: 16 }}>⏳</span><span style={{ fontSize: 12, color: "#34a876" }}>Reading...</span></div>
          : <div onClick={() => photoInputRef.current?.click()} style={{ height: 60, background: "#0d0d14", border: "2px dashed #34a87644", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 10, marginBottom: 6 }}><span style={{ fontSize: 20 }}>📷</span><span style={{ fontSize: 12, color: "#34a876", fontWeight: 700 }}>{scannedList.length > 0 ? "Scan Next Set" : "Photo the Globus label"}</span></div>}
        {pendingNums.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>Which number is the serial?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {pendingNums.map((n) => (
                <button key={n} onClick={() => { addScannedItem(n); setLastScan("✓ " + n); setPendingNums([]); }} style={{ padding: "8px 14px", background: "#1a2a1a", border: "2px solid #34a876", borderRadius: 8, color: "#34a876", fontFamily: "monospace", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>{n}</button>
              ))}
            </div>
          </div>
        )}
        {lastScan && <div style={{ fontSize: 12, color: lastScan.startsWith("✓") ? "#34a876" : "#e0a020", fontWeight: 700, marginBottom: 6, padding: "5px 10px", background: "#0d0d14", borderRadius: 6, border: "1px solid #2a2a3e" }}>{lastScan}</div>}
        {scanErr && <div style={{ fontSize: 11, color: "#e05060", padding: "5px 10px", background: "#1a0a0a", borderRadius: 6, border: "1px solid #e0506033", marginBottom: 6 }}>{scanErr}</div>}
        <div style={{ display: "flex", gap: 7, marginBottom: 8 }}>
          <input value={manualId} onChange={(e) => setManualId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && manualId.trim() && addScannedItem(manualId)} placeholder="Or type barcode + Enter..." style={{ flex: 1, padding: "7px 10px", background: "#0d0d14", border: "1px solid #2a2a3e", borderRadius: 7, color: "#ddd8cc", fontFamily: "inherit", fontSize: 12, outline: "none" }} />
          <Btn color="#34a876" small onClick={() => manualId.trim() && addScannedItem(manualId)}>Add</Btn>
        </div>
        <div style={{ fontSize: 9, color: "#555", letterSpacing: "1.5px", marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
          <span>SCANNED SETS</span><span style={{ color: scannedList.length > 0 ? "#34a876" : "#555" }}>{scannedList.length} SETS</span>
        </div>
        {scannedList.length === 0 && <div style={{ fontSize: 11, color: "#333", textAlign: "center", padding: "12px 0" }}>No sets scanned yet</div>}
        {scannedList.map((s, i) => (
          <div key={s.barcodeId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", background: i % 2 === 0 ? "#0d0d14" : "#111119", borderRadius: 6, marginBottom: 3 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.isNew ? "#e0a020" : "#34a876", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "#ddd8cc" }}>{s.name}</div>
              <div style={{ fontSize: 9, color: "#444", fontFamily: "monospace" }}>{s.barcodeId}{s.isNew && <span style={{ color: "#e0a020", marginLeft: 6 }}>NEW</span>}</div>
            </div>
            <button onClick={() => removeItem(s.barcodeId)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 14, padding: 0 }}>×</button>
          </div>
        ))}
      </>}

      {/* STEP 3 — Confirm */}
      {step === "confirm" && <>
        <div style={{ padding: "10px 12px", background: destLoc?.color + "18", border: "1px solid " + destLoc?.color + "44", borderRadius: 8, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>Moving {scannedList.length} sets to</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: destLoc?.color }}>{destLoc?.icon} {destLoc?.label}</div>
        </div>
        <div style={{ maxHeight: 220, overflowY: "auto", marginBottom: 14 }}>
          {scannedList.map((s) => (
            <div key={s.barcodeId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid #161620" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.isNew ? "#e0a020" : "#34a876", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "#ddd8cc" }}>{s.name}</div>
                <div style={{ fontSize: 9, color: "#555", fontFamily: "monospace" }}>{s.barcodeId}</div>
              </div>
              <span style={{ fontSize: 9, color: s.isNew ? "#e0a020" : "#34a876", fontWeight: 700 }}>{s.isNew ? "NEW" : "MOVE"}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
          <Btn outline color="#555" onClick={() => setStep("scan")}>← Back</Btn>
          <Btn color="#34a876" onClick={handleConfirm}>✓ Confirm All {scannedList.length} Sets</Btn>
        </div>
      </>}
    </MW>
  );
}
