// ─── Login Screen ─────────────────────────────────────────────────────────────
//
// Currently uses a simple "pick your name + 4-digit PIN" flow backed by the
// hardcoded ACCTS list in constants/accounts.js.
//
// TODO (Auth): Replace with real authentication:
//   - Email + password sign-in (Supabase Auth, Firebase, or custom JWT)
//   - "Invite teammate" flow — admin sends an email link; new user sets password
//   - Team isolation — each login is scoped to exactly one team's data
//   - "Forgot password" / password reset flow
//   - For iOS: Add Apple Sign-In via expo-apple-authentication

import React, { useState } from "react";
import { ACCTS } from "../../constants/accounts";

export default function Login({ onLogin }) {
  const [step, setStep] = useState("pick"); // "pick" | "pin"
  const [sel,  setSel]  = useState(null);
  const [pin,  setPin]  = useState("");
  const [err,  setErr]  = useState("");

  const pick = (a) => { setSel(a); setPin(""); setErr(""); setStep("pin"); };

  const digit = (d) => {
    const n = pin + d;
    setPin(n);
    if (n.length === 4) {
      setTimeout(() => {
        if (n === sel.pin) onLogin(sel.id);
        else { setErr("Incorrect PIN"); setPin(""); }
      }, 180);
    }
  };

  return (
    <div style={{
      fontFamily: "'Palatino Linotype',serif",
      background: "#0d0d14", minHeight: "100dvh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 32,
    }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 11, color: "#34a876", letterSpacing: "4px", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Territory Ops</div>
        <div style={{ fontSize: 12, color: "#333", letterSpacing: "1px" }}>Orthopedic and Spine</div>
      </div>

      {step === "pick" && (
        <div style={{ width: "100%", maxWidth: 300 }}>
          <div style={{ fontSize: 10, color: "#444", letterSpacing: "2px", textTransform: "uppercase", textAlign: "center", marginBottom: 20 }}>Who are you?</div>
          {ACCTS.map((a) => (
            <div
              key={a.id} onClick={() => pick(a)}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "#111119", border: "1px solid #1e1e2e", borderRadius: 14, marginBottom: 8, cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = a.color)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e1e2e")}
            >
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: a.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#0d0d14", fontWeight: 800 }}>{a.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#ddd8cc" }}>{a.name}</div>
                {a.admin && <div style={{ fontSize: 9, color: "#34a876", marginTop: 2, letterSpacing: "1px" }}>ADMIN</div>}
              </div>
              <span style={{ color: "#333", fontSize: 18 }}>›</span>
            </div>
          ))}
        </div>
      )}

      {step === "pin" && sel && (
        <div style={{ width: "100%", maxWidth: 240, textAlign: "center" }}>
          <div
            onClick={() => { setStep("pick"); setPin(""); setErr(""); }}
            style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 28, cursor: "pointer" }}
          >
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: sel.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#0d0d14", fontWeight: 800 }}>{sel.initials}</div>
            <span style={{ fontSize: 14, color: "#ddd8cc", fontWeight: 600 }}>{sel.name}</span>
            <span style={{ fontSize: 11, color: "#444" }}>✕</span>
          </div>
          <div style={{ fontSize: 10, color: "#555", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 20 }}>Enter PIN</div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 26 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: pin.length > i ? sel.color : "#2a2a3e", transition: "background 0.12s" }} />
            ))}
          </div>
          {err && <div style={{ fontSize: 12, color: "#e05060", marginBottom: 12 }}>{err}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d, i) => (
              <button
                key={i}
                onClick={() => { if (d === "⌫") setPin((p) => p.slice(0, -1)); else if (d) digit(d); }}
                style={{ padding: "14px 0", background: d ? "#111119" : "transparent", border: d ? "1px solid #1e1e2e" : "none", borderRadius: 10, color: "#ddd8cc", fontSize: 17, fontFamily: "inherit", cursor: d ? "pointer" : "default" }}
                onMouseEnter={(e) => d && (e.currentTarget.style.background = "#1e1e2e")}
                onMouseLeave={(e) => d && (e.currentTarget.style.background = "#111119")}
              >{d}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
