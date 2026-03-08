// ─── Case / Checklist Utilities ──────────────────────────────────────────────

/**
 * Builds an initial setChecks object for a list of set names.
 * @param {string[]} sets
 */
export const mkC = (sets) => {
  const o = {};
  sets.forEach((s) => { o[s] = { confirmed: false, assignee: null }; });
  return o;
};

/**
 * Calculates the completion percentage for a case.
 * Counts confirmed sets + returned flag + implants logged.
 */
export const cPct = (c) => {
  const conf = Object.values(c.setChecks || {}).filter((s) => s.confirmed).length;
  const tot  = c.sets.length;
  if (!tot) return 0;
  return Math.round(((conf + (c.returned ? 1 : 0) + (c.implants.length > 0 ? 1 : 0)) / (tot + 2)) * 100);
};

/**
 * Returns the status string for a case: "done" | "active" | "pending".
 */
export const cSt = (c) => {
  if (c.returned) return "done";
  if (c.sets.length > 0 && c.sets.every((s) => c.setChecks?.[s]?.confirmed)) return "active";
  return "pending";
};
