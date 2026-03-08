// ─── Date Utilities ──────────────────────────────────────────────────────────
import { TODAY } from "../constants/theme";

/** Returns true if two Date objects represent the same calendar day. */
export const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()    === b.getMonth()    &&
  a.getDate()     === b.getDate();

/**
 * Returns an array of 7 Date objects (Mon–Sun) for the week containing `anchor`.
 */
export const getWeek = (anchor) => {
  const d   = new Date(anchor);
  const day = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(mon);
    x.setDate(mon.getDate() + i);
    return x;
  });
};

/** Formats a Date as "Mon, Jan 6". */
export const fmtD = (d) =>
  d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

/** Returns true if `d` is tomorrow. */
export const isTmr = (d) => {
  const t = new Date(TODAY);
  t.setDate(t.getDate() + 1);
  return sameDay(d, t);
};
