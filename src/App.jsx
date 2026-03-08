// ─── App Root ─────────────────────────────────────────────────────────────────
// Thin auth router: shows Login or Shell based on authenticated user.
//
// TODO (Real Auth):
//   - Replace useState with a Supabase auth session listener (onAuthStateChange)
//   - On mount, restore session from localStorage / Supabase token
//   - Pass the full user object (id, name, teamId, role) to Shell
//   - Redirect to /invite/:token for invite-link sign-ups
//
// TODO (Multi-tenant):
//   - The teamId on the user object gates ALL data queries in Shell
//   - Row Level Security in Supabase enforces isolation at the DB level
//
// TODO (iOS / React Native):
//   - Replace this file with a React Navigation stack
//   - LoginScreen → MainStack (tabs defined in Shell equivalent)
import React, { useState } from "react";
import Login from "./components/auth/Login";
import Shell from "./components/layout/Shell";

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) return <Login onLogin={(id) => setUser(id)} />;
  return <Shell u={user} onLogout={() => setUser(null)} />;
}
