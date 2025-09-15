import { useMutation, useQueryClient } from "@tanstack/react-query";
import { managerService, CreateUserInput } from "../api/manager";
import { toast } from 'react-hot-toast';

/**
 * Hook for creating a new user
 */
export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateUserInput) => managerService.createUser(data),
        onSuccess: () => {
            // Invalidate users query to refetch the list
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
}

export function useCreateManager() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateUserInput) => managerService.createUserManager(data),
        onSuccess: () => {
            // Invalidate users query to refetch the list
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
}

/**
 * Hook for deleting a user
 */
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => managerService.deleteUser(id),
        onSuccess: () => {
            // Invalidate users query to refetch the list
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
}

export const useAcceptRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => managerService.acceptRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
            toast.success('Request accepted successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to accept request');
        }
    });
};

export const useRejectRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => managerService.rejectRequest(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
            toast.success('Request rejected successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to reject request');
        }
    });
};

export const useBulkAcceptRequests = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ids: string[]) => managerService.bulkAcceptRequests(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
            toast.success('Requests accepted successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to accept requests');
        }
    });
};

export const useBulkRejectRequests = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ids, reason }: { ids: string[]; reason: string }) => managerService.bulkRejectRequests(ids, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
            toast.success('Requests rejected successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to reject requests');
        }
    });
};

export const useEditUserRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ 
            id, 
            data 
        }: { 
            id: string; 
            data: { 
                date: string; 
                demandTimeFrom: string; 
                demandTimeTo: string 
            } 
        }) => managerService.editUserRequest(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
            queryClient.invalidateQueries({ queryKey: ['requests'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update request');
        }
    });
};

