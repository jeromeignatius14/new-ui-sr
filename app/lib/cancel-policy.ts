// Who may still withdraw a block request, and until when.
//
// A request belongs to the requester only until the division sanctions it.
// Once it is sanctioned it is the division's block: the hours have been
// committed and they are counted in the Block Summary Report. From that point
// the requester must not be able to make the block disappear — if the work
// cannot be done he exits without availing, or the SM / Controller rejects it,
// and either way the block stays on record as sanctioned but not availed, with
// a reason. That is what keeps sanctioned-versus-availed hours honest.
//
// The hole this closes: applying for availing moves the block from a
// "Sanctioned…" status to a "Pending…" one, so it used to reappear in the
// Edit/Cancel list and the Cancel button came back after the SSE had applied.

/** Every status a block can hold at or after sanction. */
export const POST_SANCTION_STATUSES: string[] = [
  // sanctioned, awaiting the SSE
  "Sanctioned",
  "Sanctioned, Pending with SSE For Acceptance",
  "Sanctioned and Accepted by SSE",
  "Sanctioned and Rejected by SSE",
  // availing applied for — these are the ones that used to let Cancel back in
  "Pending Concurrences",
  "Pending SM Approval",
  "Pending TRD Controller Permit",
  "SM Approved",
  "SM Rejected",
  // at site and afterwards
  "Availing Active",
  "Availing Cancelled",
  "All Closures Submitted",
  "Block Closed",
  // already withdrawn
  "Cancelled by User",
];

type CancellableRequest = {
  // The generated API types spell some of these as the String/Boolean wrapper
  // objects, so accept both rather than make every caller cast.
  overAllStatus?: string | String | null;
  isSanctioned?: boolean | Boolean | null;
  availAppliedAt?: string | String | Date | null;
  sanctionedAt?: string | String | Date | null;
};

/**
 * True only while the request is still the requester's to withdraw, i.e.
 * before the division has sanctioned it and before availing was applied for.
 */
export function isCancellableByRequester(req: CancellableRequest): boolean {
  if (!req) return false;
  if (req.isSanctioned === true) return false;
  if (req.sanctionedAt) return false;
  if (req.availAppliedAt) return false;
  if (req.overAllStatus && POST_SANCTION_STATUSES.includes(String(req.overAllStatus))) return false;
  return true;
}
