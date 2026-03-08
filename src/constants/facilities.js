// ─── Facilities ───────────────────────────────────────────────────────────────
//
// TODO (Multi-tenant): Each team should configure their own facility list.
// This will come from the team's profile in the database instead of being
// hardcoded. A Seattle team will have completely different hospitals from a
// Utah team, and data will never cross between them.

import { ACCTS } from "./accounts";

export const FACS = [
  "LDS Hospital",
  "IMC",
  "University of Utah",
  "Lone Peak Hospital",
  "St. Marks Hospital",
  "TOSH",
  "Utah Valley",
  "SMOPS",
  "VA Hospital",
  "Altaview",
  "Huntsman Cancer",
];

export const INV_LOCATIONS = [
  { id: "warehouse", label: "Company Warehouse", color: "#e0a020", icon: "🏭" },
  { id: "globus",    label: "Globus / Vendor",   color: "#a060e0", icon: "📦" },
  { id: "transit",   label: "In Transit",         color: "#7ecfff", icon: "🚚" },
  ...ACCTS.map((a) => ({
    id: "rep_" + a.id,
    label: "With " + a.name.split(" ")[0],
    color: a.color,
    icon: "👤",
    repId: a.id,
  })),
];

/** Returns the full location list (inventory + hospital facilities). */
export const ALL_LOC = (facs) => [
  ...INV_LOCATIONS,
  ...facs.map((f) => ({
    id: "fac_" + f.replace(/\s+/g, "_"),
    label: f,
    color: "#34a876",
    icon: "🏥",
    facility: f,
  })),
];

/** Find a location by id from the full list. */
export const locById = (id, facs) =>
  ALL_LOC(facs).find((l) => l.id === id) || { id, label: id, color: "#555", icon: "?" };
