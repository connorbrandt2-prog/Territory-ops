// ─── Inventory Tab ────────────────────────────────────────────────────────────
import React from "react";
import { Card, Lbl, Bdg, Btn } from "../ui";
import { FACS, ALL_LOC, locById } from "../../constants/facilities";
import { abt } from "../../constants/accounts";

export default function InventoryTab({
  u, isMobile, assets, setAssets,
  invFilter, setInvFilter, invSearch, setInvSearch, invTab, setInvTab,
  selectedAsset, setSelectedAsset, setShowScanMove, setShowBulkScan,
  newTray, setNewTray, importMsg, setImportMsg, syncAssetToLibrary, importExcel,
}) {
  const allLoc  = ALL_LOC(FACS);
  const filtered = assets.filter((a) => {
    const matchSearch = invSearch === "" || a.name.toLowerCase().includes(invSearch.toLowerCase()) || (a.barcodeId || "").toLowerCase().includes(invSearch.toLowerCase());
    const matchFilter = invFilter === "all" || a.locationId === invFilter || (!a.locationId && invFilter === "unlocated");
    return matchSearch && matchFilter;
  });
  const grouped = {};
  assets.forEach((a) => { const k = a.locationId || "unlocated"; if (!grouped[k]) grouped[k] = []; grouped[k].push(a); });
  const locatedCount   = assets.filter((a) => a.locationId).length;
  const unlocatedCount = assets.filter((a) => !a.locationId).length;

  // ── Asset detail view ──
  if (selectedAsset) {
    const asset = assets.find((a) => a.id === selectedAsset.id) || selectedAsset;
    const loc   = asset.locationId ? locById(asset.locationId, FACS) : null;
    return (
      <div style={{ padding: 16 }}>
        <button onClick={() => setSelectedAsset(null)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 12, fontFamily: "inherit", marginBottom: 12, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>← Back</button>
        <Card style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#ddd8cc", marginBottom: 3 }}>{asset.setType || asset.name}</div>
              {asset.barcodeId ? <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>Serial #{asset.barcodeId}</div> : <div style={{ fontSize: 10, color: "#555", fontStyle: "italic" }}>No serial — tap Scan to link one</div>}
            </div>
            {loc ? <Bdg bg={loc.color + "22"} color={loc.color}>{loc.icon} {loc.label}</Bdg> : <Bdg bg="#2a2a3e" color="#555">📍 Location unknown</Bdg>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn color="#34a876" small onClick={() => setShowScanMove({ asset })}>📍 Move Set</Btn>
            {!asset.barcodeId && <Btn color="#34a876" small outline onClick={() => setShowScanMove({ asset, linkBarcode: true })}>⬡ Link Barcode</Btn>}
            <Btn color="#e05060" small outline onClick={() => { if (window.confirm("Remove " + asset.name + " from inventory?")) { setAssets((p) => p.filter((a) => a.id !== asset.id)); setSelectedAsset(null); } }}>Remove</Btn>
          </div>
        </Card>

        {/* Set Photos */}
        <Card style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Lbl style={{ margin: 0 }}>Set Photos</Lbl>
            <label style={{ cursor: "pointer" }}>
              <span style={{ fontSize: 11, color: "#34a876", border: "1px solid #34a87644", borderRadius: 6, padding: "4px 12px", fontWeight: 700 }}>+ Add Photo</span>
              <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { Array.from(e.target.files).forEach((file) => { const reader = new FileReader(); reader.onload = (ev) => setAssets((p) => p.map((a) => a.id !== asset.id ? a : { ...a, photos: [...(a.photos || []), { name: file.name, url: ev.target.result, addedBy: u, date: new Date() }] })); reader.readAsDataURL(file); }); e.target.value = ""; }} />
            </label>
          </div>
          {(asset.photos || []).length === 0
            ? <div style={{ fontSize: 11, color: "#333", textAlign: "center", padding: "16px 0", border: "1px dashed #1e1e2e", borderRadius: 8 }}>No photos yet — add a reference image of what this set should look like</div>
            : <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(asset.photos || []).map((p, i) => {
                  const rep = p.addedBy ? abt(p.addedBy) : null;
                  return (
                    <div key={i} style={{ position: "relative" }}>
                      <img src={p.url} style={{ width: 88, height: 88, objectFit: "cover", borderRadius: 8, border: "1px solid #2a2a3e", display: "block", cursor: "pointer" }} onClick={() => window.open(p.url, "_blank")} />
                      <button onClick={() => setAssets((prev) => prev.map((a) => a.id !== asset.id ? a : { ...a, photos: (a.photos || []).filter((_, j) => j !== i) }))} style={{ position: "absolute", top: -5, right: -5, width: 18, height: 18, borderRadius: "50%", background: "#e05060", border: "none", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>×</button>
                      {rep && <div style={{ fontSize: 8, color: rep.color, marginTop: 3, textAlign: "center" }}>{rep.name.split(" ")[0]}</div>}
                    </div>
                  );
                })}
              </div>}
        </Card>

        {/* Movement History */}
        <Lbl>Movement History</Lbl>
        {(asset.history || []).length === 0 && <div style={{ color: "#333", fontSize: 12, fontStyle: "italic", padding: "12px 0" }}>No movement history yet.</div>}
        {(asset.history || []).map((h, i) => {
          const fromL = h.from ? locById(h.from, FACS) : null;
          const toL   = h.to   ? locById(h.to, FACS)   : null;
          const rep   = h.by   ? abt(h.by)              : null;
          return (
            <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #161620", alignItems: "flex-start" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: toL?.color || "#555", marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "#ddd8cc" }}>
                  {fromL ? <><span style={{ color: fromL.color }}>{fromL.label}</span><span style={{ color: "#555" }}> → </span></> : null}
                  {toL ? <span style={{ color: toL.color }}>{toL.label}</span> : <span style={{ color: "#555" }}>Registered</span>}
                  {h.caseId && <span style={{ fontSize: 10, color: "#4a9eff", marginLeft: 6 }}>📋 Case</span>}
                </div>
                <div style={{ fontSize: 10, color: "#444", marginTop: 2, display: "flex", gap: 8 }}>
                  <span>{h.date instanceof Date ? h.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
                  {rep && <span style={{ color: rep.color }}>{rep.name.split(" ")[0]}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Main inventory view ──
  return (
    <div style={{ padding: isMobile ? 10 : 16, paddingBottom: isMobile ? 80 : 16 }}>
      {/* Sub-tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #1e1e2e", marginBottom: 14 }}>
        {[["sets", "All Sets (" + assets.length + ")"], ["locations", "By Location"]].map(([id, label]) => (
          <button key={id} onClick={() => setInvTab(id)} style={{ flex: 1, padding: "8px", background: "transparent", border: "none", borderBottom: "2px solid " + (invTab === id ? "#34a876" : "transparent"), color: invTab === id ? "#34a876" : "#555", fontSize: 12, fontWeight: invTab === id ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>{label}</button>
        ))}
      </div>

      {/* Add by name + import */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <input value={newTray} onChange={(e) => setNewTray(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newTray.trim()) { syncAssetToLibrary(newTray.trim()); setNewTray(""); } }} placeholder="Add set by name..." style={{ flex: 1, padding: "8px 10px", background: "#0d0d14", border: "1px solid #2a2a3e", borderRadius: 7, color: "#ddd8cc", fontFamily: "inherit", fontSize: 12, outline: "none" }} />
        <Btn color="#34a876" small onClick={() => { if (newTray.trim()) { syncAssetToLibrary(newTray.trim()); setNewTray(""); } }}>Add</Btn>
        <label style={{ cursor: "pointer", padding: "5px 10px", background: "#e0a02022", border: "1px solid #e0a02044", borderRadius: 7, color: "#e0a020", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
          📥 Excel<input type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) importExcel(e.target.files[0]); e.target.value = ""; }} />
        </label>
      </div>
      {importMsg && <div style={{ fontSize: 11, color: "#34a876", padding: "5px 10px", background: "#0d1a0d", border: "1px solid #34a87633", borderRadius: 6, marginBottom: 10 }}>{importMsg}</div>}

      {/* Search */}
      <input value={invSearch} onChange={(e) => setInvSearch(e.target.value)} placeholder="Search sets or barcode ID..." style={{ width: "100%", padding: "8px 11px", background: "#111119", border: "1px solid #2a2a3e", borderRadius: 7, color: "#ddd8cc", fontFamily: "inherit", fontSize: 12, outline: "none", boxSizing: "border-box", marginBottom: 10 }} />

      {invTab === "sets" && (
        <div>
          {unlocatedCount > 0 && invFilter === "all" && invSearch === "" && (
            <div onClick={() => setInvFilter(invFilter === "unlocated" ? "all" : "unlocated")} style={{ padding: "8px 12px", background: "#1a1a0d", border: "1px solid #e0a02044", borderLeft: "3px solid #e0a020", borderRadius: 8, marginBottom: 10, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#e0a020", fontWeight: 700 }}>⚠ {unlocatedCount} sets not yet scanned</span>
              <span style={{ fontSize: 10, color: "#e0a020" }}>{invFilter === "unlocated" ? "Show all →" : "View →"}</span>
            </div>
          )}
          {assets.length > 0 && (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
              <button onClick={() => setInvFilter("all")} style={{ padding: "3px 9px", borderRadius: 20, border: "1px solid", borderColor: invFilter === "all" ? "#ddd8cc" : "#2a2a3e", background: invFilter === "all" ? "#1e1e2e" : "transparent", color: invFilter === "all" ? "#ddd8cc" : "#555", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>All</button>
              {Object.entries(grouped).sort((a, b) => b[1].length - a[1].length).map(([locId, items]) => {
                const loc = locId === "unlocated" ? { color: "#e0a020", icon: "⚠", label: "Not scanned" } : locById(locId, FACS);
                return (<button key={locId} onClick={() => setInvFilter(invFilter === locId ? "all" : locId)} style={{ padding: "3px 9px", borderRadius: 20, border: "1px solid", borderColor: invFilter === locId ? loc.color : "#2a2a3e", background: invFilter === locId ? loc.color + "22" : "transparent", color: invFilter === locId ? loc.color : "#555", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>{loc.icon} {loc.label} ({items.length})</button>);
              })}
            </div>
          )}
          {assets.length === 0
            ? <Card style={{ textAlign: "center", padding: 28 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>⬡</div>
                <div style={{ color: "#aaa", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>No sets yet</div>
                <div style={{ color: "#444", fontSize: 11, marginBottom: 14 }}>Add by name above, import from Excel, or scan a Globus barcode</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <Btn color="#34a876" small onClick={() => setShowScanMove(true)}>⬡ Scan</Btn>
                  <Btn color="#e0a020" small onClick={() => setShowBulkScan(true)}>⬡⬡ Bulk Scan</Btn>
                </div>
              </Card>
            : <div>
                {filtered.length === 0 && <div style={{ color: "#333", textAlign: "center", padding: 24, fontSize: 12 }}>No sets match</div>}
                {filtered.map((asset) => {
                  const loc  = asset.locationId ? locById(asset.locationId, FACS) : null;
                  const last = asset.history?.[0];
                  return (
                    <div key={asset.id} onClick={() => setSelectedAsset(asset)} style={{ background: "#111119", border: "1px solid #1e1e2e", borderLeft: "3px solid " + (loc?.color || "#e0a020"), borderRadius: 9, padding: "10px 12px", marginBottom: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                      {(asset.photos || []).length > 0 && <img src={asset.photos[0].url} style={{ width: 42, height: 42, objectFit: "cover", borderRadius: 7, border: "1px solid #2a2a3e", flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#ddd8cc", marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{asset.setType || asset.name}</div>
                        {asset.barcodeId && <div style={{ fontSize: 10, color: "#555", fontFamily: "monospace", marginBottom: 2 }}>#{asset.barcodeId}</div>}
                        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                          {loc ? <Bdg bg={loc.color + "22"} color={loc.color} sm>{loc.icon} {loc.label}</Bdg> : <Bdg bg="#1a1a0d" color="#e0a020" sm>⚠ Not scanned</Bdg>}
                          {last && <span style={{ fontSize: 9, color: "#333" }}>{last.date instanceof Date ? last.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>}
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setShowScanMove({ asset }); }} style={{ background: "#34a87618", border: "1px solid #34a87644", color: "#34a876", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 10, fontWeight: 700, fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0 }}>Move</button>
                    </div>
                  );
                })}
              </div>}
        </div>
      )}

      {invTab === "locations" && (
        <div>
          {Object.keys(grouped).length === 0 && <div style={{ color: "#333", fontSize: 12, textAlign: "center", padding: 24 }}>No sets yet</div>}
          {[...Object.entries(grouped)].sort((a, b) => b[1].length - a[1].length).map(([locId, items]) => {
            const loc = locId === "unlocated" ? { color: "#e0a020", icon: "⚠", label: "Not yet scanned" } : locById(locId, FACS);
            return (
              <div key={locId} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: loc.color + "18", border: "1px solid " + loc.color + "33", borderRadius: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: loc.color }}>{loc.icon} {loc.label}</span>
                  <Bdg bg={loc.color + "33"} color={loc.color}>{items.length} sets</Bdg>
                </div>
                {items.map((asset) => (
                  <div key={asset.id} onClick={() => setSelectedAsset(asset)} style={{ padding: "6px 12px", marginBottom: 3, background: "#0d0d14", border: "1px solid #161620", borderRadius: 7, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#ddd8cc" }}>{asset.name}</span>
                    {asset.barcodeId && <span style={{ fontSize: 9, color: "#34a876" }}>⬡</span>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
