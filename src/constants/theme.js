// ─── Theme: Colors, Status Maps, Time Constants ──────────────────────────────

/** Color per specialty */
export const SPEC_COLOR = {
  "Spine":            "#4a9eff",
  "Hip & Knee":       "#34a876",
  "Shoulder & Elbow": "#e0a020",
  "Trauma":           "#a060e0",
  "Other":            "#888",
};

// Alias used in some places
export const SC = SPEC_COLOR;

/** Task priority config */
export const PRIO = {
  high:   { c: "#e05060", bg: "#3d1520", l: "High" },
  medium: { c: "#e0a020", bg: "#3d2e00", l: "Medium" },
  low:    { c: "#555",    bg: "#1e1e2e", l: "Low" },
};

/** Case status config */
export const ST = {
  done:    { bar: "#34a876", badge: "#1a3d2b", bt: "#34a876", l: "Returned" },
  active:  { bar: "#e0a020", badge: "#3d2e00", bt: "#e0a020", l: "Confirmed" },
  pending: { bar: "#3a3a5a", badge: "#1e1e2e", bt: "#555",    l: "Pending" },
};

/** Loaner status colors */
export const LSTC = { Received: "#34a876", Returned: "#4a9eff", Borrowed: "#e0a020" };
export const LSTS = ["Received", "Returned", "Borrowed"];

// Date / calendar helpers
export const TODAY = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  new Date().getDate()
);
export const DAYS   = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
