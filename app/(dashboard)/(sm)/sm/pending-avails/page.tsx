"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Toaster, toast } from "react-hot-toast";
import { format } from "date-fns";
import { useGetSmPending } from "@/app/service/query/avail";
import { useSmApproveAvail, useSmAcknowledgeClosure, useSmApproveExtension } from "@/app/service/mutation/avail";

export default function SmPendingAvailsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"approvals" | "closures" | "extensions">("approvals");

  // Approval modal state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveRequest, setApproveRequest] = useState<any>(null);
  const [smRemarks, setSmRemarks] = useState("");
  const [modifyTime, setModifyTime] = useState(false);
  const [smTimeFrom, setSmTimeFrom] = useState("");
  const [smTimeTo, setSmTimeTo] = useState("");
  const [approveAction, setApproveAction] = useState<"APPROVE" | "APPROVE_WITH_MODIFICATION" | "REJECT">("APPROVE");

  // Reject modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRequest, setRejectRequest] = useState<any>(null);
  const [rejectRemarks, setRejectRemarks] = useState("");

  // Closure acknowledgement modal state
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [closureRequest, setClosureRequest] = useState<any>(null);
  const [closureAckRemarks, setClosureAckRemarks] = useState("");

  // Extension modal state
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionRequest, setExtensionRequest] = useState<any>(null);
  const [extensionAction, setExtensionAction] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [extensionSmRemarks, setExtensionSmRemarks] = useState("");

  const { data, isLoading, refetch } = useGetSmPending();
  const approveMutation = useSmApproveAvail();
  const closureAckMutation = useSmAcknowledgeClosure();
  const extensionMutation = useSmApproveExtension();

  const pendingApprovals: any[] = data?.data?.pendingApprovals ?? [];
  const pendingClosures: any[] = data?.data?.pendingClosures ?? [];
  const pendingExtensions: any[] = data?.data?.pendingExtensions ?? [];

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "—";
    try {
      return format(new Date(isoString), "dd-MM-yyyy HH:mm");
    } catch {
      return isoString;
    }
  };

  // Validate SM cannot reduce duration by more than 30%
  const validateTimeModification = (request: any, timeFrom: string, timeTo: string): boolean => {
    if (!request?.grantedFromTime || !request?.grantedToTime) return true;
    const originalDuration =
      new Date(request.grantedToTime).getTime() - new Date(request.grantedFromTime).getTime();
    const newDuration = new Date(timeTo).getTime() - new Date(timeFrom).getTime();
    const minAllowed = originalDuration * 0.7;
    if (newDuration < minAllowed) {
      toast.error("Cannot reduce block duration by more than 30%");
      return false;
    }
    return true;
  };

  const handleOpenApprove = (request: any) => {
    setApproveRequest(request);
    setSmRemarks("");
    setModifyTime(false);
    setSmTimeFrom("");
    setSmTimeTo("");
    setApproveAction("APPROVE");
    setShowApproveModal(true);
  };

  const handleOpenReject = (request: any) => {
    setRejectRequest(request);
    setRejectRemarks("");
    setShowRejectModal(true);
  };

  const handleSubmitApprove = () => {
    if (!approveRequest) return;
    const action: "APPROVE" | "APPROVE_WITH_MODIFICATION" = modifyTime
      ? "APPROVE_WITH_MODIFICATION"
      : "APPROVE";
    if (action === "APPROVE_WITH_MODIFICATION") {
      if (!smTimeFrom || !smTimeTo) {
        toast.error("Please enter both modified time values");
        return;
      }
      if (!validateTimeModification(approveRequest, smTimeFrom, smTimeTo)) return;
    }
    approveMutation.mutate(
      {
        requestId: approveRequest._id || approveRequest.id,
        action,
        smApprovedTimeFrom: modifyTime ? smTimeFrom : undefined,
        smApprovedTimeTo: modifyTime ? smTimeTo : undefined,
        smRemarks: smRemarks || undefined,
      },
      {
        onSuccess: () => {
          setShowApproveModal(false);
          refetch();
        },
      }
    );
  };

  const handleSubmitReject = () => {
    if (!rejectRequest) return;
    if (!rejectRemarks.trim()) {
      toast.error("Please enter rejection remarks");
      return;
    }
    approveMutation.mutate(
      {
        requestId: rejectRequest._id || rejectRequest.id,
        action: "REJECT",
        smRemarks: rejectRemarks,
      },
      {
        onSuccess: () => {
          setShowRejectModal(false);
          refetch();
        },
      }
    );
  };

  const handleOpenClosureAck = (request: any) => {
    setClosureRequest(request);
    setClosureAckRemarks("");
    setShowClosureModal(true);
  };

  const handleSubmitClosureAck = () => {
    if (!closureRequest) return;
    closureAckMutation.mutate(
      {
        requestId: closureRequest._id || closureRequest.id,
        smClosureRemarks: closureAckRemarks,
      },
      {
        onSuccess: () => {
          setShowClosureModal(false);
          refetch();
        },
      }
    );
  };

  const handleOpenExtension = (req: any, action: "APPROVE" | "REJECT") => {
    setExtensionRequest(req);
    setExtensionAction(action);
    setExtensionSmRemarks("");
    setShowExtensionModal(true);
  };

  const handleSubmitExtension = () => {
    if (!extensionRequest) return;
    if (extensionAction === "REJECT" && !extensionSmRemarks.trim()) {
      toast.error("Please enter rejection remarks");
      return;
    }
    extensionMutation.mutate(
      {
        requestId: extensionRequest._id || extensionRequest.id,
        action: extensionAction,
        smRemarks: extensionSmRemarks || undefined,
      },
      {
        onSuccess: () => {
          setShowExtensionModal(false);
          refetch();
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#fffbe9]">
      <Toaster />
      {/* Header */}
      <div className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-2" style={{ minHeight: 60 }}>
        <span className="text-2xl font-bold text-black">Station Master — Availing Approvals</span>
      </div>

      <div className="p-4">
        {/* Station info */}
        <div className="text-sm text-gray-600 mb-4">
          Station: <span className="font-semibold">{session?.user?.depot || "—"}</span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-300 mb-4">
          <button
            className={`px-6 py-2 font-semibold text-sm border-b-2 transition ${
              activeTab === "approvals"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("approvals")}
          >
            Pending Approvals
            {pendingApprovals.length > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                {pendingApprovals.length}
              </span>
            )}
          </button>
          <button
            className={`px-6 py-2 font-semibold text-sm border-b-2 transition ${
              activeTab === "closures"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("closures")}
          >
            Pending Closures
            {pendingClosures.length > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                {pendingClosures.length}
              </span>
            )}
          </button>
          <button
            className={`px-6 py-2 font-semibold text-sm border-b-2 transition ${
              activeTab === "extensions"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("extensions")}
          >
            Pending Extensions
            {pendingExtensions.length > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                {pendingExtensions.length}
              </span>
            )}
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        )}

        {/* Pending Approvals Tab */}
        {activeTab === "approvals" && !isLoading && (
          <div>
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-white border border-gray-200 rounded">
                No pending availing approvals
              </div>
            ) : (
              pendingApprovals.map((req: any) => (
                <div key={req._id || req.id} className="bg-white border border-black rounded mb-3 p-4">
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div><span className="font-semibold">Section:</span> {req.selectedSection || req.missionBlock || "—"}</div>
                    <div><span className="font-semibold">Work Type:</span> {req.workType || "—"}</div>
                    <div><span className="font-semibold">Dept:</span> {req.selectedDepartment || "—"}</div>
                    <div><span className="font-semibold">Depot:</span> {req.selectedDepo || "—"}</div>
                    <div><span className="font-semibold">Granted From:</span> {formatTime(req.grantedFromTime)}</div>
                    <div><span className="font-semibold">Granted To:</span> {formatTime(req.grantedToTime)}</div>
                    {req.oheMasFrom && <div><span className="font-semibold">OHE From:</span> {req.oheMasFrom}</div>}
                    {req.oheMasTo && <div><span className="font-semibold">OHE To:</span> {req.oheMasTo}</div>}
                  </div>

                  {/* Concurrence statuses */}
                  {(req.trdAvailConcurrences?.length > 0 || req.sntAvailConcurrences?.length > 0 || req.enggAvailConcurrences?.length > 0) && (
                    <div className="mb-3 text-xs">
                      <p className="font-semibold text-gray-600 mb-1">Concurrences:</p>
                      {req.trdAvailConcurrences?.map((c: any, i: number) => (
                        <span key={i} className={`inline-block mr-2 px-2 py-0.5 rounded text-white ${c.status === "ACCEPTED" ? "bg-green-600" : c.status === "REJECTED" ? "bg-red-600" : "bg-yellow-500"}`}>
                          TRD/{c.depot}: {c.status}
                        </span>
                      ))}
                      {req.sntAvailConcurrences?.map((c: any, i: number) => (
                        <span key={i} className={`inline-block mr-2 px-2 py-0.5 rounded text-white ${c.status === "ACCEPTED" ? "bg-green-600" : c.status === "REJECTED" ? "bg-red-600" : "bg-yellow-500"}`}>
                          S&T/{c.depot}: {c.status}
                        </span>
                      ))}
                      {req.enggAvailConcurrences?.map((c: any, i: number) => (
                        <span key={i} className={`inline-block mr-2 px-2 py-0.5 rounded text-white ${c.status === "ACCEPTED" ? "bg-green-600" : c.status === "REJECTED" ? "bg-red-600" : "bg-yellow-500"}`}>
                          ENGG/{c.depot}: {c.status}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleOpenApprove(req)}
                      className="bg-green-600 text-white text-sm px-4 py-1.5 rounded font-semibold hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleOpenApprove(req);
                        setModifyTime(true);
                        setApproveAction("APPROVE_WITH_MODIFICATION");
                      }}
                      className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded font-semibold hover:bg-blue-700"
                    >
                      Approve with Time Change
                    </button>
                    <button
                      onClick={() => handleOpenReject(req)}
                      className="bg-red-600 text-white text-sm px-4 py-1.5 rounded font-semibold hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pending Closures Tab */}
        {activeTab === "closures" && !isLoading && (
          <div>
            {pendingClosures.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-white border border-gray-200 rounded">
                No pending block closures
              </div>
            ) : (
              pendingClosures.map((req: any) => (
                <div key={req._id || req.id} className="bg-white border border-black rounded mb-3 p-4">
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div><span className="font-semibold">Section:</span> {req.selectedSection || req.missionBlock || "—"}</div>
                    <div><span className="font-semibold">Depot:</span> {req.selectedDepo || "—"}</div>
                    <div><span className="font-semibold">Granted From:</span> {formatTime(req.grantedFromTime)}</div>
                    <div><span className="font-semibold">Granted To:</span> {formatTime(req.grantedToTime)}</div>
                    {req.smApprovedTimeFrom && <div><span className="font-semibold">SM Time From:</span> {formatTime(req.smApprovedTimeFrom)}</div>}
                    {req.smApprovedTimeTo && <div><span className="font-semibold">SM Time To:</span> {formatTime(req.smApprovedTimeTo)}</div>}
                    {req.availingStartedAt && <div><span className="font-semibold">Availing Started:</span> {formatTime(req.availingStartedAt)}</div>}
                    {req.closureYard && <div><span className="font-semibold">Closure Yard:</span> {req.closureYard}</div>}
                    {req.closureRemarks && <div className="col-span-2"><span className="font-semibold">Closure Remarks:</span> {req.closureRemarks}</div>}
                  </div>
                  <button
                    onClick={() => handleOpenClosureAck(req)}
                    className="bg-orange-600 text-white text-sm px-4 py-1.5 rounded font-semibold hover:bg-orange-700"
                  >
                    Acknowledge Closure
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pending Extensions Tab */}
        {activeTab === "extensions" && !isLoading && (
          <div>
            {pendingExtensions.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-white border border-gray-200 rounded">
                No pending time extension requests
              </div>
            ) : (
              pendingExtensions.map((req: any) => (
                <div key={req._id || req.id} className="bg-white border border-black rounded mb-3 p-4">
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div><span className="font-semibold">Section:</span> {req.selectedSection || req.missionBlock || "—"}</div>
                    <div><span className="font-semibold">Depot:</span> {req.selectedDepo || "—"}</div>
                    <div><span className="font-semibold">Approved From:</span> {formatTime(req.smApprovedTimeFrom ?? req.grantedFromTime)}</div>
                    <div><span className="font-semibold">Approved To:</span> {formatTime(req.smApprovedTimeTo ?? req.grantedToTime)}</div>
                    <div className="col-span-2 bg-blue-50 p-2 rounded border border-blue-200">
                      <span className="font-semibold text-blue-800">Extension Requested To:</span>{" "}
                      <span className="text-blue-900 font-bold">{formatTime(req.extensionRequestedTo)}</span>
                    </div>
                    {req.extensionRemarks && (
                      <div className="col-span-2">
                        <span className="font-semibold">SSE Remarks:</span> {req.extensionRemarks}
                      </div>
                    )}
                    {req.availingStartedAt && (
                      <div><span className="font-semibold">Availing Started:</span> {formatTime(req.availingStartedAt)}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenExtension(req, "APPROVE")}
                      className="bg-green-600 text-white text-sm px-4 py-1.5 rounded font-semibold hover:bg-green-700"
                    >
                      Approve Extension
                    </button>
                    <button
                      onClick={() => handleOpenExtension(req, "REJECT")}
                      className="bg-red-600 text-white text-sm px-4 py-1.5 rounded font-semibold hover:bg-red-700"
                    >
                      Reject Extension
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && approveRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-black w-full max-w-md p-5">
            <h3 className="text-lg font-bold mb-4">
              {modifyTime ? "Approve with Time Modification" : "Approve Availing Request"}
            </h3>

            {modifyTime && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">
                  Original granted: {formatTime(approveRequest.grantedFromTime)} — {formatTime(approveRequest.grantedToTime)}
                </p>
                <p className="text-xs text-orange-600 mb-3 font-semibold">
                  Note: Duration cannot be reduced by more than 30%
                </p>
                <label className="block text-sm font-semibold mb-1">New Time From</label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-3"
                  value={smTimeFrom}
                  onChange={(e) => setSmTimeFrom(e.target.value)}
                />
                <label className="block text-sm font-semibold mb-1">New Time To</label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={smTimeTo}
                  onChange={(e) => setSmTimeTo(e.target.value)}
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Remarks (optional)</label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                rows={3}
                placeholder="Enter remarks..."
                value={smRemarks}
                onChange={(e) => setSmRemarks(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmitApprove}
                disabled={approveMutation.isPending}
                className="flex-1 bg-green-600 text-white py-2 rounded font-semibold text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {approveMutation.isPending ? "Submitting..." : "Confirm Approve"}
              </button>
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 bg-gray-200 text-black py-2 rounded font-semibold text-sm hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && rejectRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-black w-full max-w-md p-5">
            <h3 className="text-lg font-bold mb-4">Reject Availing Request</h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Rejection Remarks *</label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                rows={3}
                placeholder="Enter reason for rejection..."
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSubmitReject}
                disabled={approveMutation.isPending}
                className="flex-1 bg-red-600 text-white py-2 rounded font-semibold text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {approveMutation.isPending ? "Submitting..." : "Confirm Reject"}
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-gray-200 text-black py-2 rounded font-semibold text-sm hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extension Approve/Reject Modal */}
      {showExtensionModal && extensionRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-black w-full max-w-md p-5">
            <h3 className="text-lg font-bold mb-4">
              {extensionAction === "APPROVE" ? "Approve Time Extension" : "Reject Time Extension"}
            </h3>
            <div className="text-sm mb-4 bg-gray-50 p-3 rounded border">
              <div><span className="font-semibold">Section:</span> {extensionRequest.selectedSection || extensionRequest.missionBlock || "—"}</div>
              <div><span className="font-semibold">Current End:</span> {formatTime(extensionRequest.smApprovedTimeTo ?? extensionRequest.grantedToTime)}</div>
              <div className="text-blue-800 font-semibold mt-1">
                Requested New End: {formatTime(extensionRequest.extensionRequestedTo)}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">
                Remarks {extensionAction === "REJECT" ? "*" : "(optional)"}
              </label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                rows={3}
                placeholder={extensionAction === "REJECT" ? "Enter reason for rejection..." : "Enter remarks..."}
                value={extensionSmRemarks}
                onChange={(e) => setExtensionSmRemarks(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSubmitExtension}
                disabled={extensionMutation.isPending}
                className={`flex-1 text-white py-2 rounded font-semibold text-sm disabled:opacity-50 ${
                  extensionAction === "APPROVE" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {extensionMutation.isPending
                  ? "Submitting..."
                  : extensionAction === "APPROVE"
                  ? "Confirm Approve"
                  : "Confirm Reject"}
              </button>
              <button
                onClick={() => setShowExtensionModal(false)}
                className="flex-1 bg-gray-200 text-black py-2 rounded font-semibold text-sm hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Closure Acknowledgement Modal */}
      {showClosureModal && closureRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-black w-full max-w-md p-5">
            <h3 className="text-lg font-bold mb-4">Acknowledge Block Closure</h3>
            <div className="text-sm mb-4 bg-gray-50 p-3 rounded border">
              <div><span className="font-semibold">Section:</span> {closureRequest.selectedSection || closureRequest.missionBlock || "—"}</div>
              <div><span className="font-semibold">Closure Yard:</span> {closureRequest.closureYard || "—"}</div>
              <div><span className="font-semibold">SSE Remarks:</span> {closureRequest.closureRemarks || "—"}</div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">SM Closure Remarks (optional)</label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                rows={3}
                placeholder="Enter remarks..."
                value={closureAckRemarks}
                onChange={(e) => setClosureAckRemarks(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSubmitClosureAck}
                disabled={closureAckMutation.isPending}
                className="flex-1 bg-orange-600 text-white py-2 rounded font-semibold text-sm hover:bg-orange-700 disabled:opacity-50"
              >
                {closureAckMutation.isPending ? "Submitting..." : "Acknowledge & Close"}
              </button>
              <button
                onClick={() => setShowClosureModal(false)}
                className="flex-1 bg-gray-200 text-black py-2 rounded font-semibold text-sm hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
