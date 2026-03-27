"use client";

import { useSession } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { useGetSmPending } from "@/app/service/query/avail";
import { AVAIL_STATUS } from "@/app/lib/store";

export default function SmActiveBlocksPage() {
  const { data: session } = useSession();
  const { data, isLoading, refetch } = useGetSmPending();

  const allBlocks: any[] = data?.data?.pendingApprovals ?? [];

  // Active blocks = currently availing
  const activeBlocks = allBlocks.filter(
    (r: any) => r.overAllStatus === AVAIL_STATUS.AVAILING_ACTIVE
  );

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "—";
    try {
      const iso = new Date(isoString).toISOString();
      const [y, m, d] = iso.slice(0, 10).split("-");
      return `${d}-${m}-${y} ${iso.slice(11, 16)}`;
    } catch {
      return isoString;
    }
  };

  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const nowIST = () => Date.now() + IST_OFFSET_MS;

  // Block burst: if grantedToTime + 30 minute buffer is in the past
  const isBlockBurst = (req: any): boolean => {
    if (!req.grantedToTime) return false;
    const bufferMs = 30 * 60 * 1000;
    return nowIST() > new Date(req.grantedToTime).getTime() + bufferMs;
  };

  // Time elapsed display (minutes)
  const getElapsedMinutes = (req: any): number => {
    const start = req.availingStartedAt || req.smApprovedTimeFrom || req.grantedFromTime;
    if (!start) return 0;
    return Math.floor((nowIST() - new Date(start).getTime()) / 60000);
  };

  // Remaining time display (minutes — may be negative if burst)
  const getRemainingMinutes = (req: any): number => {
    const end = req.smApprovedTimeTo || req.grantedToTime;
    if (!end) return 0;
    return Math.floor((new Date(end).getTime() - nowIST()) / 60000);
  };

  return (
    <div className="min-h-screen bg-[#fffbe9]">
      <Toaster />
      {/* Header */}
      <div className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2" style={{ minHeight: 60 }}>
        <span className="text-2xl font-bold text-black">Active Blocks — Live Monitor</span>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            Station: <span className="font-semibold">{session?.user?.depot || "—"}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="text-sm bg-yellow-200 border border-black px-3 py-1 rounded font-semibold hover:bg-yellow-300"
          >
            Refresh
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        )}

        {!isLoading && activeBlocks.length === 0 && (
          <div className="text-center py-10 text-gray-500 bg-white border border-gray-200 rounded">
            No blocks currently availing
          </div>
        )}

        {!isLoading && activeBlocks.map((req: any) => {
          const burst = isBlockBurst(req);
          const elapsed = getElapsedMinutes(req);
          const remaining = getRemainingMinutes(req);

          return (
            <div
              key={req._id || req.id}
              className={`border rounded mb-4 p-4 ${burst ? "bg-red-50 border-red-600" : "bg-white border-black"}`}
            >
              {burst && (
                <div className="bg-red-600 text-white text-center text-sm font-bold py-1 px-3 rounded mb-3">
                  ⚠ BLOCK BURST — Time Exceeded
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div><span className="font-semibold">Section:</span> {req.selectedSection || req.missionBlock || "—"}</div>
                <div><span className="font-semibold">Work Type:</span> {req.workType || "—"}</div>
                <div><span className="font-semibold">Dept:</span> {req.selectedDepartment || "—"}</div>
                <div><span className="font-semibold">Depot:</span> {req.selectedDepo || "—"}</div>
                <div><span className="font-semibold">SM Time From:</span> {formatTime(req.smApprovedTimeFrom || req.grantedFromTime)}</div>
                <div><span className="font-semibold">SM Time To:</span> {formatTime(req.smApprovedTimeTo || req.grantedToTime)}</div>
                {req.availingStartedAt && (
                  <div><span className="font-semibold">Availing Started:</span> {formatTime(req.availingStartedAt)}</div>
                )}
                {req.oheMasFrom && <div><span className="font-semibold">OHE From:</span> {req.oheMasFrom}</div>}
                {req.oheMasTo && <div><span className="font-semibold">OHE To:</span> {req.oheMasTo}</div>}
              </div>

              {/* Timer display */}
              <div className={`flex gap-4 text-sm font-semibold p-2 rounded ${burst ? "bg-red-100" : "bg-yellow-100"}`}>
                <span>Elapsed: {elapsed} min</span>
                <span className={remaining < 0 ? "text-red-700" : remaining < 15 ? "text-orange-600" : "text-green-700"}>
                  {remaining >= 0 ? `Remaining: ${remaining} min` : `Overrun: ${Math.abs(remaining)} min`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
