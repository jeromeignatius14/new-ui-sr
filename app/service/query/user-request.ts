// tan stack query get all user request by user id

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axiosInstance";
import { userRequestService } from "../api/user-request";
import { UserRequestInput } from "@/app/validation/user-request";

export interface RequestResponse {
    status: boolean;
    message: string;
    data: {
        requests: RequestItem[];
        total: number;
        page: number;
        totalPages: number;
    };
}

export interface RequestItem {
    overAllStatus: String;
    emergencyBlockRemarks: any;
    powerBlockDisconnectionAssignTo: string;
    sntDisconnectionAssignTo: any;
    divisionId:any,
    isSanctioned: boolean;
    remarkByManager: string;
    adjacentLinesAffected: string;
    id: string;
    date: string;
    selectedDepartment: string;
    selectedSection: string;
    stationID: string | null;
    missionBlock: string;
    workType: string;
    activity: string;
    selectedStream: string | null;
    selectedStreams?: any;
    selectedRoads?: any;
    cautionRequired: boolean;
    cautionSpeed: number | null;
    cautionLocationFrom: string | null;
    cautionLocationTo: string | null;
    freshCautionRequired: boolean | null;
    freshCautionSpeed: number | null;
    freshCautionLocationFrom: string | null;
    freshCautionLocationTo: string | null;
    workLocationFrom: string;
    workLocationTo: string;
    demandTimeFrom: string;
    demandTimeTo: string;
    sigDisconnection: boolean;
    elementarySection: string | null;
    elementarySectionTo: string | null;
    sigElementarySectionFrom: string | null;
    sigElementarySectionTo: string | null;
    repercussions: string | null;
    requestremarks: string;
    createdAt: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    selectedDepo: string;
    sigResponse: string | null;
    ohDisconnection: string | null;
    oheDisconnection: string | null;
    oheResponse: string | null;
    corridorType: string | null;
    corridorTypeSelection: string | null;
    sigActionsNeeded: boolean;
    trdActionsNeeded: boolean;
    ManagerResponse: string | null;
    sigDisconnectionRequirements: string | null;
    sntDisconnectionRequirements: string[] | null;
    sntDisconnectionLine: string | null;
    sntDisconnectionLineFrom: string | null;
    sntDisconnectionLineTo: string | null;
    trdDisconnectionRequirements: string | null;
    powerBlockRequirements: string[] | null;
    powerBlockRequired: boolean;
    sntDisconnectionRequired: boolean;
    processedLineSections: {
        block: string;
        type: string;
        lineName?: string;
        otherLines?: string;
        stream?: string;
        road?: string;
        otherRoads?: string;
    }[] | null;
    routeFrom: string | null;
    routeTo: string | null;
    userId: string;
    managerAcceptance: boolean;
    DisconnAcceptance: string | null;
    managerId: string | null;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}

export type DateRangeFilter = {
    startDate: string;
    endDate: string;
};

/**
 * Hook to get a single user request by ID
 * @param id - The ID of the request to fetch
 * @returns Query result with the request data
 */
export function useGetUserRequestById(id: string) {
    return useQuery({
        queryKey: ['user-request', id],
        queryFn: () => userRequestService.getById(id),
        enabled: !!id,
    });
}

export function useGetUserRequests(page = 1, limit = 10, dateRange?: DateRangeFilter) {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    if (dateRange) {
        queryParams.append('startDate', dateRange.startDate);
        queryParams.append('endDate', dateRange.endDate);
    }

    return useQuery<RequestResponse>({
        queryKey: ['user-requests', page, limit, dateRange],
        queryFn: async () => {
            const response = await axiosInstance.get(`/api/user-request/user?${queryParams.toString()}`);
            return response.data;
        },
    });
}

export function useGetWeeklyUserRequests(weekRange: DateRangeFilter) {
    return useGetUserRequests(1, 100, weekRange);
}

/**
 * Hook to get other requests by depo
 * @param selectedDepo - The selected depo
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 * @param startDate - Start date for filtering (optional)
 * @param endDate - End date for filtering (optional)
 * @returns Query result with the other requests data
 */
export function useGetOtherRequests(
  selectedDepo: string, 
  page = 1, 
  limit = 100,
  startDate?: string,
  endDate?: string,
  userDepartement?:string
) {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);

  return useQuery({
    queryKey: ['other-requests', selectedDepo, page, limit, startDate, endDate,userDepartement],
    queryFn: () => userRequestService.getOtherRequests(selectedDepo, page, limit, startDate, endDate,userDepartement),
    enabled: !!selectedDepo,
  });
}

/**
 * Hook to update a user request by ID with auto-refetching
 * @param id - The ID of the request to update
 */
export function useUpdateUserRequestQuery(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<UserRequestInput>) => userRequestService.update(id, data),
        onSuccess: () => {
            // Invalidate relevant queries to trigger refetch
            queryClient.invalidateQueries({ queryKey: ['user-request', id] });
            queryClient.invalidateQueries({ queryKey: ['user-requests'] });
        },
    });
}
