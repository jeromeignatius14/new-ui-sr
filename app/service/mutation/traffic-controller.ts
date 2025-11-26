import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trafficControllerService } from "../api/traffic-controller";
export function useEditUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      trafficControllerService.editUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trafficControllerUsers"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: trafficControllerService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trafficControllerUsers"] });
    },
  });
}
export function useAddUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: trafficControllerService.addUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trafficControllerUsers"] });
    },
  });
}