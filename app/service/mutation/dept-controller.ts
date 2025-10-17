import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deptControllerService } from "../api/dept-controller";

export function useAddUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deptControllerService.addUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deptControllerUsers"] });
    },
  });
}

export function useEditUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      deptControllerService.editUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deptControllerUsers"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deptControllerService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deptControllerUsers"] });
    },
  });
}

export function useEditJE() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jeId, data }: { jeId: string; data: any }) =>
      deptControllerService.editJE(jeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deptControllerUsers"] });
    },
  });
}

export function useDeleteJE() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deptControllerService.deleteJE,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deptControllerUsers"] });
    },
  });
}
