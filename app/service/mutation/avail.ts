import { useMutation, useQueryClient } from "@tanstack/react-query";
import { availService } from "../api/avail";
import { toast } from "react-hot-toast";

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["avail-depot-blocks"] });
  qc.invalidateQueries({ queryKey: ["avail-my-participations"] });
  qc.invalidateQueries({ queryKey: ["avail-concurrences"] });
  qc.invalidateQueries({ queryKey: ["avail-request"] });
}

export function useApplyForAvailing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: {
      requestId: string;
      requestedTimeFrom?: string;
      requestedTimeTo?: string;
      smStation?: string;
      oheMasFrom?: string;
      oheMasTo?: string;
    }) => availService.applyForAvailing(p),
    onSuccess: () => { invalidateAll(qc); toast.success("Availing application submitted"); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to apply for availing"),
  });
}

export function useSubmitConcurrence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { requestId: string; accept: boolean; remarks?: string; userDepartment?: string }) =>
      availService.submitConcurrence(p.requestId, p.accept, p.remarks, p.userDepartment),
    onSuccess: (_, v) => { invalidateAll(qc); toast.success(v.accept ? "Concurrence accepted" : "Concurrence rejected"); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to submit concurrence"),
  });
}

export function useAcknowledgeSmGrant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { requestId: string; accept: boolean; remarks?: string }) =>
      availService.acknowledgeSmGrant(p.requestId, p.accept, p.remarks),
    onSuccess: (_, v) => { invalidateAll(qc); toast.success(v.accept ? "Grant accepted — availing will begin soon" : "Grant rejected"); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to acknowledge"),
  });
}

export function useStartAvailing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: string | { requestId: string; latitude?: number | null; longitude?: number | null; geoCheckBypassed?: boolean }) => {
      const requestId = typeof p === "string" ? p : p.requestId;
      return availService.startAvailing(requestId);
    },
    onSuccess: () => { invalidateAll(qc); toast.success("Availing started"); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to start availing"),
  });
}

export function useCloseBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: {
      requestId: string;
      closureRemarks?: string;
      closureImage?: File | null;
      closureReconnectedSignal?: string;
      closureCautionKmph?: string;
      closureOheMadeFit?: boolean;
    }) => availService.closeBlock(p.requestId, p.closureRemarks, p.closureImage, p.closureReconnectedSignal, p.closureCautionKmph, p.closureOheMadeFit),
    onSuccess: () => { invalidateAll(qc); toast.success("Closure submitted — awaiting SM acknowledgement"); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to submit closure"),
  });
}

export function useRequestExtension() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { requestId: string; newEndTime: string; remarks?: string; isEmergency?: boolean; emergencyReason?: string }) =>
      availService.requestExtension(p.requestId, p.newEndTime, p.remarks, p.isEmergency, p.emergencyReason),
    onSuccess: () => { invalidateAll(qc); toast.success("Extension requested — awaiting SM"); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to request extension"),
  });
}

// Alias: when SM modifies time, SSE must accept or reject — same API as acknowledgeSmGrant
export const useSseRespondToSmModification = useAcknowledgeSmGrant;

// Alias for backwards compatibility
export const useSubmitAvailConcurrence = useSubmitConcurrence;

export function useSmApproveAvail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { requestId: string; action: "APPROVE" | "APPROVE_WITH_MODIFICATION" | "REJECT"; smApprovedTimeFrom?: string; smApprovedTimeTo?: string; smRemarks?: string }) =>
      availService.smApproveAvail(p.requestId, p.action, { smApprovedTimeFrom: p.smApprovedTimeFrom, smApprovedTimeTo: p.smApprovedTimeTo, smRemarks: p.smRemarks }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sm-pending"] }); toast.success("Action completed"); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to process request"),
  });
}

export function useSmApproveExtension() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { requestId: string; participantId?: string; action: "APPROVE" | "REJECT"; smRemarks?: string }) =>
      availService.smApproveExtension(p.requestId, p.participantId ?? "", p.action, p.smRemarks),
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ["sm-pending"] }); toast.success(v.action === "APPROVE" ? "Extension approved" : "Extension rejected"); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed"),
  });
}

export function useSmAcknowledgeClosure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { requestId: string; smClosureRemarks: string }) =>
      availService.smAcknowledgeClosure(p.requestId, p.smClosureRemarks),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sm-pending"] }); toast.success("Block closed ✓"); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed"),
  });
}

export function useTrdPermitAvail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { requestId: string; action: "APPROVE" | "APPROVE_WITH_MODIFICATION" | "REJECT"; smApprovedTimeFrom?: string; smApprovedTimeTo?: string; smRemarks?: string }) =>
      availService.trdPermitAvail(p.requestId, p.action, { smApprovedTimeFrom: p.smApprovedTimeFrom, smApprovedTimeTo: p.smApprovedTimeTo, smRemarks: p.smRemarks }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["trd-pending"] }); toast.success("Action completed"); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed"),
  });
}

export function useTrdApproveExtension() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { requestId: string; participantId: string; action: "APPROVE" | "REJECT"; smRemarks?: string }) =>
      availService.trdApproveExtension(p.requestId, p.participantId, p.action, p.smRemarks),
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ["trd-pending"] }); toast.success(v.action === "APPROVE" ? "Extension approved" : "Extension rejected"); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed"),
  });
}

export function useTrdAcknowledgeClosure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { requestId: string; smClosureRemarks: string }) =>
      availService.trdAcknowledgeClosure(p.requestId, p.smClosureRemarks),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["trd-pending"] }); toast.success("Block closed ✓"); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed"),
  });
}
