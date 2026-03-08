// ─── Team Accounts ───────────────────────────────────────────────────────────
//
// TODO (Multi-tenant / SaaS): Replace this hardcoded list with a real
// authentication system. Each "team" (e.g. a Seattle sales team) should have
// its own isolated data space. Users should sign in with email/password and
// invite teammates — not be pre-loaded here.
//
// Planned auth flow:
//   1. Team admin creates an account and a team profile
//   2. Admin sends invite links to teammates (email-based)
//   3. Each user sets their own password — no shared PINs
//   4. Each team's data (cases, assets, surgeons) is isolated by teamId
//
// Subscription tiers will gate team size, features, and storage.
//
// For iOS: Use Apple Sign-In / Expo Auth Session when migrating to React Native.

export const ACCTS = [
  { id: "connor",  name: "Connor Brandt",  initials: "CB", color: "#4a9eff", pin: "1234", admin: true },
  { id: "brook",   name: "Brook Vaughan",  initials: "BV", color: "#e0a020", pin: "5678", admin: true },
  { id: "josiah",  name: "Josiah Talbert", initials: "JT", color: "#7ecfff", pin: "1111" },
  { id: "bryce",   name: "Bryce Wagner",   initials: "BW", color: "#e05060", pin: "2222" },
  { id: "riley",   name: "Riley Rothey",   initials: "RR", color: "#a060e0", pin: "3333" },
  { id: "matt",    name: "Matt Beynon",    initials: "MB", color: "#ccc",    pin: "4444" },
  { id: "brawley", name: "Brawley Lamer",  initials: "BL", color: "#888",    pin: "5555" },
  { id: "park",    name: "Park Begley",    initials: "PB", color: "#f07820", pin: "7777" },
];

/** Look up an account by id — falls back to first account if not found. */
export const abt = (id) => ACCTS.find((a) => a.id === id) || ACCTS[0];
