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

// Which board a block belongs to.
//
// A TRD applicant now picks one depot from a dropdown, and that choice is stored
// in smStation. When it is present it is AUTHORITATIVE and nothing else is
// consulted: it is the applicant naming the board that should receive the block.
//
// This matters because appliedByDepot is copied from the applicant's own user
// record, and a construction or senior TRD user carries every depot on the
// division ("ALLP,CKI,CN,ERS,KTYM,…"). Reading that alongside the choice would
// widen a deliberate single-board selection back out to all three boards and
// make the dropdown pointless.
//
// Only when smStation holds something that is not a depot — an older block,
// raised when the picker still offered station codes — do we fall back to the
// depot fields, splitting comma lists so those blocks reach a board at all
// rather than none.
export function blockOnBoard(r: any, boardDepots: string[]): boolean {
  const chosen = String(r?.smStation ?? "").trim().toUpperCase();
  if (TPC_DEPOTS.includes(chosen)) return boardDepots.includes(chosen);
  return depotCodesOf(r).some((c) => boardDepots.includes(c));
}
