export type BatchGroupItem =
  | { isBatch: true; batchId: string; requests: any[] }
  | { isBatch: false; request: any };

export function groupRequestsByBatch(requests: any[]): BatchGroupItem[] {
  const result: BatchGroupItem[] = [];
  const batchMap = new Map<string, any[]>();

  for (const req of requests) {
    if (req.batchId) {
      if (!batchMap.has(req.batchId)) {
        batchMap.set(req.batchId, []);
      }
      batchMap.get(req.batchId)!.push(req);
    } else {
      result.push({ isBatch: false, request: req });
    }
  }

  // Insert batches at the position of their first request in the original order
  const seenBatches = new Set<string>();
  const final: BatchGroupItem[] = [];
  for (const req of requests) {
    if (req.batchId) {
      if (!seenBatches.has(req.batchId)) {
        seenBatches.add(req.batchId);
        final.push({ isBatch: true, batchId: req.batchId, requests: batchMap.get(req.batchId)! });
      }
    } else {
      final.push({ isBatch: false, request: req });
    }
  }

  return final;
}
