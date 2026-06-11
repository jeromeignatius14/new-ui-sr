"use client";
import React, { useState } from "react";

interface BatchGroupBannerProps {
  batchId: string;
  batchTimeFrom: string | null;
  batchTimeTo: string | null;
  totalSpells: number;
  children: React.ReactNode;
}

function fmt(dt: string | null): string {
  if (!dt) return "--";
  const d = new Date(dt);
  const h = d.getUTCHours().toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function BatchGroupBanner({ batchId, batchTimeFrom, batchTimeTo, totalSpells, children }: BatchGroupBannerProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{
      border: "2.5px solid #3b82f6",
      borderRadius: "12px",
      marginBottom: "12px",
      overflow: "hidden",
      background: "#f0f7ff",
    }}>
      {/* Batch header bar */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          background: "linear-gradient(90deg, #1d4ed8 0%, #3b82f6 100%)",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "18px" }}>⚡</span>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: "14px" }}>
            BATCH — {totalSpells} Spells
          </span>
          <span style={{
            background: "#bfdbfe", color: "#1e3a8a", borderRadius: "8px",
            padding: "2px 10px", fontSize: "13px", fontWeight: 700,
          }}>
            {fmt(batchTimeFrom)} – {fmt(batchTimeTo)}
          </span>
        </div>
        <span style={{ color: "#fff", fontSize: "16px", fontWeight: 700 }}>
          {expanded ? "▲" : "▼"} {totalSpells} spells
        </span>
      </div>

      {/* Spell rows */}
      {expanded && (
        <div style={{ padding: "8px 8px 4px" }}>
          {children}
        </div>
      )}
    </div>
  );
}

/** Group an array of requests by batchId, preserving order. */
export function groupRequestsByBatch(requests: any[]): Array<{ isBatch: false; request: any } | { isBatch: true; batchId: string; requests: any[] }> {
  const result: Array<{ isBatch: false; request: any } | { isBatch: true; batchId: string; requests: any[] }> = [];
  const batchMap = new Map<string, any[]>();
  const order: string[] = [];

  for (const req of requests) {
    if (!req.batchId) {
      result.push({ isBatch: false, request: req });
    } else {
      if (!batchMap.has(req.batchId)) {
        batchMap.set(req.batchId, []);
        order.push(req.batchId);
      }
      batchMap.get(req.batchId)!.push(req);
    }
  }

  // Insert batches at the position of their first spell in the original array
  // We rebuild result preserving insertion order
  const finalResult: typeof result = [];
  const seenBatches = new Set<string>();

  for (const req of requests) {
    if (!req.batchId) {
      finalResult.push({ isBatch: false, request: req });
    } else if (!seenBatches.has(req.batchId)) {
      seenBatches.add(req.batchId);
      const spells = batchMap.get(req.batchId)!.sort((a, b) => (a.batchSpellIndex ?? 0) - (b.batchSpellIndex ?? 0));
      finalResult.push({ isBatch: true, batchId: req.batchId, requests: spells });
    }
  }

  return finalResult;
}
