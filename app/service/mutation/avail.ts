import { useMutation, useQueryClient } from "@tanstack/react-query";
import { availService } from "../api/avail";
import { toast } from "react-hot-toast";

export function useApplyForAvailing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      oheMasFrom,
      oheMasTo,
    }: {
      requestId: string;
      oheMasFrom: string;
      oheMasTo: string;
    }) => availService.applyForAvailing(requestId, oheMasFrom, oheMasTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avail-sanctioned-blocks"] });
      queryClient.invalidateQueries({ queryKey: ["avail-my-blocks"] });
      queryClient.invalidateQueries({ queryKey: ["avail-requests"] });
      toast.success("Availing application submitted successfully");
    },
    onError: () => toast.error("Failed to apply for availing"),
  });
}

export function useSubmitAvailConcurrence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      requestId: string;
      accept: boolean;
      acceptRemarks?: string;
      rejectRemarks?: string;
      userDepartement?: string;
    }) =>
      availService.submitAvailConcurrence(
        params.requestId,
        params.accept,
        params.acceptRemarks,
        params.rejectRemarks,
        params.userDepartement
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avail-concurrences"] });
      toast.success("Concurrence submitted successfully");
    },
    onError: () => toast.error("Failed to submit concurrence"),
  });
}

export function useSmApproveAvail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      requestId: string;
      action: "APPROVE" | "APPROVE_WITH_MODIFICATION" | "REJECT";
      smApprovedTimeFrom?: string;
      smApprovedTimeTo?: string;
      smRemarks?: string;
    }) =>
      availService.smApproveAvail(params.requestId, params.action, {
        smApprovedTimeFrom: params.smApprovedTimeFrom,
        smApprovedTimeTo: params.smApprovedTimeTo,
        smRemarks: params.smRemarks,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sm-pending"] });
      toast.success("Action completed successfully");
    },
    onError: () => toast.error("Failed to process request"),
  });
}

export function useSseRespondToSmModification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, accept }: { requestId: string; accept: boolean }) =>
      availService.sseRespondToSmModification(requestId, accept),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["avail-requests"] });
      toast.success(vars.accept ? "SM modification accepted" : "Availing cancelled");
    },
    onError: () => toast.error("Failed to submit response"),
  });
}

export function useStartAvailing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      requestId: string;
      latitude: number | null;
      longitude: number | null;
      geoCheckBypassed: boolean;
    }) =>
      availService.startAvailing(
        params.requestId,
        params.latitude,
        params.longitude,
        params.geoCheckBypassed
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avail-my-blocks"] });
      queryClient.invalidateQueries({ queryKey: ["avail-requests"] });
      toast.success("Availing started");
    },
    onError: () => toast.error("Failed to start availing"),
  });
}

export function useCloseBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      closureYard,
      closureRemarks,
    }: {
      requestId: string;
      closureYard: string;
      closureRemarks: string;
    }) => availService.closeBlock(requestId, closureYard, closureRemarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avail-requests"] });
      toast.success("Block closed — pending SM acknowledgement");
    },
    onError: () => toast.error("Failed to submit closure"),
  });
}

export function useRequestExtension() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      newEndTime,
      remarks,
    }: {
      requestId: string;
      newEndTime: string;
      remarks?: string;
    }) => availService.requestExtension(requestId, newEndTime, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avail-my-blocks"] });
      queryClient.invalidateQueries({ queryKey: ["avail-request"] });
      toast.success("Extension requested — waiting for SM approval");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to request extension"),
  });
}

export function useSmApproveExtension() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      action,
      smRemarks,
    }: {
      requestId: string;
      action: "APPROVE" | "REJECT";
      smRemarks?: string;
    }) => availService.smApproveExtension(requestId, action, smRemarks),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["sm-pending"] });
      toast.success(vars.action === "APPROVE" ? "Extension approved" : "Extension rejected");
    },
    onError: () => toast.error("Failed to process extension"),
  });
}

export function useSmAcknowledgeClosure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      smClosureRemarks,
    }: {
      requestId: string;
      smClosureRemarks: string;
    }) => availService.smAcknowledgeClosure(requestId, smClosureRemarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sm-pending"] });
      toast.success("Closure acknowledged — Block Closed");
    },
    onError: () => toast.error("Failed to acknowledge closure"),
  });
}
