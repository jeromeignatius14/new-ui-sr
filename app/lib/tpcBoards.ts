// ── TPC control boards ────────────────────────────────────────────────────────
// A TRD block is permitted by the TRD controller manning a board, and a board is
// a stretch of line described by the depots along it. This is the single source
// of truth for that mapping — both the applicant's depot picker and the
// controller's board filter read it, so the two cannot drift apart.
export type TpcBoard = { name: string; depots: string[] };

export const TPC_BOARDS: TpcBoard[] = [
  { name: "TPC (SRR-VARD-STRL)", depots: ["TCR", "CKI", "ERS"] },
  { name: "TPC (STRL-VARD-PVU/SP)", depots: ["KTYM", "ALLP", "KYJ", "QLN"] },
  { name: "TPC (PVU/SP-MP/SP)", depots: ["KZK", "NCJ", "NNN"] },
];

// Every depot a TRD applicant may choose, in board order.
export const TPC_DEPOTS: string[] = TPC_BOARDS.flatMap((b) => b.depots);

export function boardNameForDepot(depot: string): string | null {
  const d = String(depot || "").trim();
  return TPC_BOARDS.find((b) => b.depots.includes(d))?.name ?? null;
}

// Which depot codes a block carries.
//
// Three fields may hold one, and all three must be read:
//   smStation       - what a TRD applicant now picks; it is a DEPOT for TRD
//                     blocks and a station code for everything else
//   appliedByDepot  - the applicant's own depot, and the only field populated
//                     on older records
//   selectedDepo    - the depot the block was raised against
//
// Any of them may be a comma-separated list. A construction block is routinely
// raised across every depot on the division ("CN,TCR,CKI,ERS,…"), and matching
// such a value whole against a board list finds nothing — which is why those
// blocks were invisible to every controller.
export function depotCodesOf(r: {
  smStation?: string | null;
  appliedByDepot?: string | null;
  selectedDepo?: string | null;
}): string[] {
  return [r.smStation, r.appliedByDepot, r.selectedDepo]
    .filter(Boolean)
    .flatMap((v) => String(v).split(","))
    .map((d) => d.trim().toUpperCase())
    .filter(Boolean);
}

// A block belongs to a board if ANY depot it carries sits on that board. A block
// spanning several depots therefore shows on every board it touches, which is
// correct: each of those controllers holds part of it.
export function blockOnBoard(r: any, boardDepots: string[]): boolean {
  const codes = depotCodesOf(r);
  return codes.some((c) => boardDepots.includes(c));
}
