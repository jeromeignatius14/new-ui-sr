/**
 * blockLines.ts — single source of truth for displaying the lines/roads a block covers.
 *
 * WHY THIS EXISTS
 * ---------------
 * When the SSE picks the lines for a block section, it is ONE multi-select.
 * create-block-request stores that selection as "first + rest":
 *
 *     const lineName   = values[0];                 // e.g. "UP"
 *     const otherLines = values.slice(1).join(",")  // e.g. "DN"
 *     const road       = roads[0];
 *     const otherRoads = roads.slice(1).join(",")
 *
 * So `otherLines` / `otherRoads` are NOT "affected but not blocked" — they are
 * the remaining lines of the same block, split only by how the form saves them.
 *
 * Screens that render `processedLineSections[0].lineName` therefore show a
 * combined UP&DN block as a single UP block, and also silently drop every
 * section after the first. That is the defect TrD/PGT raised in
 * TPC/PGT/II/FTCB-RBP dt.10.08.2026 §2 (issue PGT-3).
 *
 * Always format block lines through these helpers so every screen agrees.
 */

export interface BlockLineSection {
  block?: string;
  type?: string;
  lineName?: string;
  otherLines?: string;
  road?: string;
  otherRoads?: string;
  stream?: string;
}

/**
 * Split a stored "A,B, C" value into ["A","B","C"].
 * Real data contains entries typed as "& PAY FCI SIDING", so a leading
 * ampersand is stripped — otherwise joining produces "... & & PAY FCI SIDING".
 */
const toParts = (value?: string | null): string[] =>
  (value ?? "")
    .split(",")
    .map((v) => v.trim().replace(/^&\s*/, "").trim())
    .filter(Boolean);

/** Every line and road covered by ONE section, in selection order, de-duplicated. */
export function sectionBlockedLines(section?: BlockLineSection | null): string[] {
  if (!section) return [];
  return Array.from(
    new Set([
      ...toParts(section.lineName),
      ...toParts(section.otherLines),
      ...toParts(section.road),
      ...toParts(section.otherRoads),
    ]),
  );
}

/** One section, combined: "UP & DN". */
export function formatSectionBlockedLines(
  section?: BlockLineSection | null,
  fallback = "N/A",
): string {
  const values = sectionBlockedLines(section);
  return values.length > 0 ? values.join(" & ") : fallback;
}

/**
 * Every section of a request, combined: "UP & DN & RD 3".
 * Use this for table cells and report columns — it never drops a section.
 */
export function formatBlockedLines(
  sections?: BlockLineSection[] | null,
  fallback = "N/A",
): string {
  const values = Array.from(
    new Set((sections ?? []).flatMap((s) => sectionBlockedLines(s))),
  );
  return values.length > 0 ? values.join(" & ") : fallback;
}

/**
 * Grouped by block section: "KTU-TUA: UP & DN, TUA-YD: RD 3".
 * Use where the block name adds clarity (detail views, multi-section blocks).
 */
export function formatBlockedLinesByBlock(
  sections?: BlockLineSection[] | null,
  fallback = "N/A",
): string {
  const parts = (sections ?? [])
    .map((s) => {
      const lines = formatSectionBlockedLines(s, "");
      if (!lines) return "";
      return s.block ? `${s.block}: ${lines}` : lines;
    })
    .filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : fallback;
}
