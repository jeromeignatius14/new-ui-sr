/**
 * duration.ts — single formatter for block durations.
 *
 * Durations are held internally as decimal hours (e.g. 6.67). They must be
 * presented to users as HH:MM with a colon — 6.67 hours reads as 6:40, and
 * 20.5 hours reads as 20:30. Decimal hours ("6.67") and the older "06h 40m"
 * style are not used on screen or in the Excel downloads.
 *
 * Requested by TrD/PGT following letter TPC/PGT/II/FTCB-RBP dt.10.08.2026 §3;
 * it also matches the HH:MM convention of the table enclosed with that letter.
 */

/** 6.67 -> "6:40" ; 20.5 -> "20:30" ; 0 -> "0:00" */
export function formatHoursHHMM(hours?: number | null): string {
  const h = Number(hours);
  if (!Number.isFinite(h)) return "0:00";

  const negative = h < 0;
  const totalMins = Math.round(Math.abs(h) * 60);
  const hh = Math.floor(totalMins / 60);
  const mm = totalMins % 60;

  return `${negative ? "-" : ""}${hh}:${String(mm).padStart(2, "0")}`;
}

/** "6:40 / 5" — duration alongside its block count, as shown in the summary. */
export function formatHoursWithCount(
  hours?: number | null,
  count?: number | null,
): string {
  return `${formatHoursHHMM(hours)} / ${count ?? 0}`;
}
