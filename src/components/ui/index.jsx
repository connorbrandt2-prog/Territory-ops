// ─── UI Primitive Components ─────────────────────────────────────────────────
//
// Small, reusable building blocks used throughout the app.
// All styling uses inline style objects (dark theme: #0d0d14 background).
//
// TODO (iOS / React Native): These will need React Native equivalents when
// migrating. Recommended approach: wrap each primitive so the web version uses
// <div>/<button> and the native version uses <View>/<TouchableOpacity>, with
// shared logic extracted to hooks.
//
// TODO (Design System): Extract all hex color values to a shared theme object
// so a redesign only requires changing one file.

import React from "react";
import { ACCTS, abt } from "../../constants/accounts";

/** Small colored badge / pill label. */
export const Bdg = ({ children, bg, color, sm }) => (
  <span style={{
    background: bg, color,
    fontSize: sm ? 9 : 10,
    padding: sm ? "1px 6px" : "2px 8px",
    borderRadius: 20, fontWeight: 700, whiteSpace: "nowrap",
  }}>{children}</span>
);

/** Uppercase section label. */
export const Lbl = ({ children, color }) => (
  <div style={{
    fontSize: 9, letterSpacing: "2px",
    color: color || "#444", textTransform: "uppercase", marginBottom: 8,
  }}>{children}</div>
);

/** Dark card container with optional accent border. */
export const Card = ({ children, accent, style }) => (
  <div style={{
    background: "#111119",
    border: "1px solid " + (accent || "#1e1e2e"),
    borderRadius: 12, padding: "14px 16px", ...style,
  }}>{children}</div>
);

/** Text input styled for dark theme. */
export const Inp = ({ value, onChange, placeholder, type, style }) => (
  <input
    type={type || "text"} value={value || ""} onChange={onChange}
    placeholder={placeholder}
    style={{
      width: "100%", padding: "8px 11px",
      background: "#0d0d14", border: "1px solid #2a2a3e",
      borderRadius: 7, color: "#ddd8cc", fontFamily: "inherit",
      fontSize: 13, outline: "none", boxSizing: "border-box", ...style,
    }}
  />
);

/** Select dropdown styled for dark theme. */
export const Sel = ({ value, onChange, children, style }) => (
  <select
    value={value || ""} onChange={onChange}
    style={{
      width: "100%", padding: "8px 11px",
      background: "#0d0d14", border: "1px solid #2a2a3e",
      borderRadius: 7, color: "#ddd8cc", fontFamily: "inherit",
      fontSize: 13, outline: "none", boxSizing: "border-box", ...style,
    }}
  >{children}</select>
);

/** Primary / outline button. */
export const Btn = ({ children, onClick, color, text, outline, small, style }) => {
  const c = color || "#4a9eff";
  const t = text || "#fff";
  return (
    <button
      onClick={onClick}
      style={{
        padding: small ? "5px 11px" : "8px 17px",
        background: outline ? "transparent" : c,
        color: outline ? c : t,
        border: "1px solid " + c,
        borderRadius: 7, fontFamily: "inherit",
        fontSize: small ? 11 : 13, fontWeight: 700,
        cursor: "pointer", whiteSpace: "nowrap", ...style,
      }}
    >{children}</button>
  );
};

/** Avatar dot showing a team member's initials. */
export const Dot = ({ id, size }) => {
  const sz = size || 22;
  const a  = abt(id);
  return (
    <div
      title={a.name}
      style={{
        width: sz, height: sz, borderRadius: "50%", background: a.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: sz * 0.36, color: "#0d0d14", fontWeight: 800, flexShrink: 0,
      }}
    >{a.initials}</div>
  );
};

/** Section header with a colored dot and optional count badge. */
export const SH = ({ color, label, count }) => (
  <div style={{
    fontSize: 9, letterSpacing: "2px", color,
    textTransform: "uppercase", marginBottom: 10,
    display: "flex", alignItems: "center", gap: 8,
  }}>
    <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
    {label}
    {count !== undefined && (
      <span style={{
        background: color + "22", color, borderRadius: 20,
        padding: "1px 7px", fontSize: 10,
      }}>{count}</span>
    )}
  </div>
);

/** Modal wrapper — full-screen overlay with centered card. */
export const MW = ({ children }) => (
  <div style={{
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 200, padding: 16,
  }}>
    <div style={{
      background: "#13131e", borderRadius: 18, padding: 24,
      border: "1px solid #2a2a3e",
      boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
      maxHeight: "88vh", overflowY: "auto",
      width: "100%", maxWidth: 520,
    }}>{children}</div>
  </div>
);

/** Modal title. */
export const MT = ({ children }) => (
  <div style={{ fontSize: 15, fontWeight: 700, color: "#ddd8cc", marginBottom: 16 }}>
    {children}
  </div>
);

/** Small field label (above input). */
export const FL = ({ children, color }) => (
  <div style={{
    fontSize: 9, letterSpacing: "1.5px",
    color: color || "#555", textTransform: "uppercase", marginBottom: 4,
  }}>{children}</div>
);

/** Form field wrapper with bottom margin. */
export const F = ({ children, mb }) => (
  <div style={{ marginBottom: mb !== undefined ? mb : 11 }}>{children}</div>
);

/** Textarea styled for dark theme. */
export const TA = ({ value, onChange, rows, placeholder }) => (
  <textarea
    value={value || ""} onChange={onChange}
    rows={rows || 2} placeholder={placeholder}
    style={{
      width: "100%", padding: "8px 11px",
      background: "#0d0d14", border: "1px solid #2a2a3e",
      borderRadius: 7, color: "#ddd8cc", fontFamily: "inherit",
      fontSize: 12, outline: "none", resize: "vertical",
      boxSizing: "border-box",
    }}
  />
);

/**
 * Team member avatar picker.
 * @param {string|null} value - Selected account id, or null for "unassigned".
 * @param {(id: string|null) => void} onChange
 * @param {boolean} nullable - If true, shows a "–" unassign option.
 */
export const AcPick = ({ value, onChange, nullable }) => (
  <div style={{
    display: "flex", gap: 5, alignItems: "center",
    overflowX: "auto", flexWrap: "nowrap", paddingBottom: 2,
  }}>
    {nullable && (
      <div
        onClick={() => onChange(null)}
        style={{
          width: 24, height: 24, borderRadius: "50%",
          border: "1px dashed #444",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: 11, color: "#444",
          background: value === null ? "#1e1e2e" : "transparent",
          flexShrink: 0,
        }}
      >-</div>
    )}
    {ACCTS.map((a) => (
      <div
        key={a.id}
        onClick={() => onChange(a.id)}
        title={a.name}
        style={{
          width: 24, height: 24, borderRadius: "50%",
          background: value === a.id ? a.color : a.color + "33",
          border: "2px solid " + (value === a.id ? a.color : "transparent"),
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 8,
          color: value === a.id ? "#fff" : a.color,
          fontWeight: 800, cursor: "pointer", flexShrink: 0,
        }}
      >{a.initials}</div>
    ))}
  </div>
);
