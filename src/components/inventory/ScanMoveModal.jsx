// ─── Scan / Move / Register Single Set Modal ─────────────────────────────────
import React, { useState } from "react";
import { MW, MT, FL, F, Btn, Bdg } from "../ui";
import { runOCR } from "../../utils/ocr";

export default function ScanMoveModal({ currentUser, assets, allLoc, allTrays, initialAsset, onRegister, onMove, onClose }) {
  const [mode,       setMode]       = useState(initialAsset ? "move" : "scan");
  const [foundAsset, setFoundAsset] = useState(initialAsset || null);
  const [scanning,   setScanning]   = useState(false);
  const [scanErr,    setScanErr]    = useState("");
  const [scanHint,   setScanHint]   = useState("");
  const [scannedId,  setScannedId]  = useState(initialAsset?.barcodeId || "");
  const [manualId,   setManualId]   = useState("");
  const [setType,    setSetType]    = useState("");
  const [typeSearch, setTypeSearch] = useState("");
  const [locId,      setLocId]      = useState(allLoc[0]?.id || "");
  const [regPhotos,  setRegPhotos]  = useState([]);
  const [foundNums,  setFoundNums]  = useState([]);
  const photoInputRef = React.useRef(null);

  const addRegPhoto = (file) => {
    const r = new FileReader();
    r.onload = (e) => setRegPhotos((p) => [...p, { name: file.name, url: e.target.result, addedBy: currentUser, date: new Date() }]);
    r.readAsDataURL(file);
  };

  React.useEffect(() => () => {}, []);

  const processPhoto = async (file) => {
    if (!file) return;
    setScanErr(""); setScanHint("Reading..."); setScanning(true); setFoundNums([]);
    try {
      const nums = await runOCR(file);
      if (nums && nums.length > 0) { setFoundNums(nums); setScanning(false); setScanHint(""); }
      else { setScanErr("No numbers found — try again or enter manually."); setScanning(false); }
    } catch (e) { setScanErr("Error: " + e.message); setScanning(false); }
  };

  const handleBarcodeFound = (id) => {
    setScannedId(id);
    const existing = assets.find((a) => a.barcodeId === id);
    if (existing) { setFoundAsset(existing); setMode("move"); }
    else { setFoundAsset(null); setMode("register"); }
  };

  const locColor = allLoc.find((l) => l.id === locId)?.color || "#555";

  return (
    <MW>
      <MT>{mode === "scan" ? "Scan Set Barcode" : mode === "register" ? "Register New Set" : "Move Set"}</MT>

      {/* SCAN MODE */}
      {mode === "scan" && <>
        <div style={{ marginBottom: 14 }}>
          <input ref={photoInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => processPhoto(e.target.files[0])} />
          {scanning
            ? <div style={{ height: 120, background: "#0d0d14", border: "1px solid #34a87655", borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}><div style={{ fontSize: 22 }}>⏳</div><div style={{ fontSize: 13, color: "#34a876" }}>{scanHint || "Reading serial number..."}</div></div>
            : <div onClick={() => photoInputRef.current?.click()} style={{ height: 140, background: "#0d0d14", border: "2px dashed #34a87655", borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 8 }}><div style={{ fontSize: 36 }}>📷</div><div style={{ fontSize: 13, color: "#34a876", fontWeight: 700 }}>Photo the white Globus label tag</div><div style={{ fontSize: 10, color: "#555" }}>Fill the frame with just the white sticker — not the whole tray</div></div>}
          {scanErr && <div style={{ fontSize: 11, color: "#e05060", padding: "6px 10px", background: "#1a0a0a", borderRadius: 6, border: "1px solid #e0506033", marginBottom: 8, marginTop: 8 }}>{scanErr}</div>}
          {foundNums.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 8 }}>Which number is the serial?</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {foundNums.map((n) => (
                  <button key={n} onClick={() => { setFoundNums([]); handleBarcodeFound(n); }} style={{ padding: "10px 18px", background: "#1a2a1a", border: "2px solid #34a876", borderRadius: 8, color: "#34a876", fontFamily: "monospace", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>{n}</button>
                ))}
              </div>
              <div style={{ fontSize: 10, color: "#555", marginTop: 8 }}>Tap the serial from the white Globus sticker</div>
            </div>
          )}
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginBottom: 6 }}>OR ENTER BARCODE MANUALLY</div>
          <div style={{ display: "flex", gap: 7 }}>
            <input autoFocus inputMode="numeric" value={manualId} onChange={(e) => setManualId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && manualId.trim() && handleBarcodeFound(manualId.trim())} placeholder="Type barcode ID (e.g. 2024851)" style={{ flex: 1, padding: "12px 14px", background: "#0d0d14", border: "2px solid #34a87655", borderRadius: 8, color: "#ddd8cc", fontFamily: "inherit", fontSize: 16, outline: "none" }} />
            <Btn color="#34a876" onClick={() => manualId.trim() && handleBarcodeFound(manualId.trim())}>Look Up</Btn>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}><Btn outline color="#555" onClick={onClose}>Cancel</Btn></div>
      </>}

      {/* REGISTER MODE */}
      {mode === "register" && <>
        <div style={{ padding: "8px 12px", background: "#34a87618", border: "1px solid #34a87633", borderRadius: 7, marginBottom: 14, fontSize: 11, color: "#34a876" }}>
          New set — Serial: <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{scannedId || "manual"}</span>
        </div>
        <F mb={14}><FL color="#34a876">Set Type</FL>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 8 }}>Pick an existing type or type a new one</div>
          {setType
            ? <div style={{ padding: "8px 12px", background: "#34a87622", border: "1px solid #34a876", borderRadius: 8, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontSize: 13, fontWeight: 700, color: "#34a876" }}>{setType}</div><div style={{ fontSize: 10, color: "#34a876aa" }}>Serial: {scannedId || "—"}</div></div>
                <button onClick={() => { setSetType(""); setTypeSearch(""); }} style={{ background: "none", border: "none", color: "#34a876", cursor: "pointer", fontSize: 16, padding: 0 }}>×</button>
              </div>
            : <div>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <input value={typeSearch} onChange={(e) => setTypeSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && typeSearch.trim()) { setSetType(typeSearch.trim()); setTypeSearch(""); } }} placeholder="Search or type new set type + Enter..." style={{ flex: 1, padding: "8px 10px", background: "#0d0d14", border: "1px solid #2a2a3e", borderRadius: 7, color: "#ddd8cc", fontFamily: "inherit", fontSize: 12, outline: "none" }} />
                  {typeSearch.trim() && <button onClick={() => { setSetType(typeSearch.trim()); setTypeSearch(""); }} style={{ padding: "6px 12px", background: "#34a876", border: "none", borderRadius: 7, color: "#0d0d14", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Use "{typeSearch.trim()}"</button>}
                </div>
                {(allTrays || []).filter((t) => !typeSearch || t.toLowerCase().includes(typeSearch.toLowerCase())).length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, maxHeight: 120, overflowY: "auto" }}>
                    {(allTrays || []).filter((t) => !typeSearch || t.toLowerCase().includes(typeSearch.toLowerCase())).map((t) => (
                      <button key={t} onClick={() => { setSetType(t); setTypeSearch(""); }} style={{ padding: "5px 10px", borderRadius: 20, border: "1px solid #2a2a3e", background: "transparent", color: "#555", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{t}</button>
                    ))}
                  </div>
                )}
                {(allTrays || []).length === 0 && !typeSearch && <div style={{ fontSize: 11, color: "#555", fontStyle: "italic", padding: "8px 0" }}>No set types yet — type a name above to create one</div>}
              </div>}
        </F>
        <F mb={14}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <FL>Set Photo</FL>
            {regPhotos.length > 0 && <label style={{ cursor: "pointer" }}><span style={{ fontSize: 11, color: "#34a876", border: "1px solid #34a87644", borderRadius: 6, padding: "3px 10px", fontWeight: 700 }}>+ Add</span><input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { Array.from(e.target.files).forEach(addRegPhoto); e.target.value = ""; }} /></label>}
          </div>
          {regPhotos.length === 0
            ? <label style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "20px", background: "#0d0d14", border: "2px dashed #34a87633", borderRadius: 10 }}>
                <div style={{ fontSize: 28 }}>📷</div><div style={{ fontSize: 12, color: "#34a876", fontWeight: 700 }}>Tap to photograph the set</div><div style={{ fontSize: 10, color: "#444" }}>Reference image for your whole team</div>
                <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { Array.from(e.target.files).forEach(addRegPhoto); e.target.value = ""; }} />
              </label>
            : <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {regPhotos.map((p, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img src={p.url} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #34a87644", display: "block" }} />
                    <button onClick={() => setRegPhotos((prev) => prev.filter((_, j) => j !== i))} style={{ position: "absolute", top: -5, right: -5, width: 18, height: 18, borderRadius: "50%", background: "#e05060", border: "none", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>×</button>
                  </div>
                ))}
                <label style={{ cursor: "pointer", width: 80, height: 80, background: "#0d0d14", border: "2px dashed #34a87633", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#34a876" }}>+<input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { Array.from(e.target.files).forEach(addRegPhoto); e.target.value = ""; }} /></label>
              </div>}
        </F>
        <F mb={16}><FL>Current Location</FL>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, maxHeight: 160, overflowY: "auto" }}>
            {allLoc.map((l) => { const active = locId === l.id; return (<button key={l.id} onClick={() => setLocId(l.id)} style={{ padding: "5px 10px", borderRadius: 20, border: "1px solid " + (active ? l.color : "#2a2a3e"), background: active ? l.color + "22" : "transparent", color: active ? l.color : "#555", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: active ? 700 : 400 }}>{l.icon} {l.label}</button>); })}
          </div>
        </F>
        {!(setType || typeSearch).trim() && <div style={{ fontSize: 11, color: "#e0a020", padding: "6px 10px", background: "#1a1500", border: "1px solid #e0a02033", borderRadius: 6, marginBottom: 10 }}>Enter or select a set type above to continue</div>}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn outline color="#555" onClick={() => setMode("scan")}>← Back</Btn>
          <Btn color="#34a876" onClick={() => { const t = (setType || typeSearch).trim(); if (!t) return; onRegister(scannedId, t, locId, currentUser, regPhotos); onClose(); }} style={{ opacity: (setType || typeSearch).trim() ? 1 : 0.4 }}>Register Set</Btn>
        </div>
      </>}

      {/* MOVE MODE */}
      {mode === "move" && foundAsset && <>
        <div style={{ padding: "8px 12px", background: "#111119", border: "1px solid #2a2a3e", borderRadius: 7, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd8cc", marginBottom: 2 }}>{foundAsset.name}</div>
          <div style={{ fontSize: 9, color: "#555", fontFamily: "monospace" }}>{foundAsset.barcodeId}</div>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
            {(() => { const l = allLoc.find((x) => x.id === foundAsset.locationId); return l ? <Bdg bg={l.color + "22"} color={l.color}>{l.icon} {l.label}</Bdg> : null; })()}
            <span style={{ fontSize: 11, color: "#555" }}>→ moving to...</span>
          </div>
        </div>
        <F mb={16}><FL>New Location</FL>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, maxHeight: 180, overflowY: "auto" }}>
            {allLoc.filter((l) => l.id !== foundAsset.locationId).map((l) => { const active = locId === l.id; return (<button key={l.id} onClick={() => setLocId(l.id)} style={{ padding: "5px 10px", borderRadius: 20, border: "1px solid " + (active ? l.color : "#2a2a3e"), background: active ? l.color + "22" : "transparent", color: active ? l.color : "#555", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: active ? 700 : 400 }}>{l.icon} {l.label}</button>); })}
          </div>
        </F>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn outline color="#555" onClick={() => setMode("scan")}>← Back</Btn>
          <Btn color="#34a876" onClick={() => { if (!locId) return; onMove(foundAsset.id, locId, currentUser); onClose(); }}>Confirm Move</Btn>
        </div>
      </>}
    </MW>
  );
}
