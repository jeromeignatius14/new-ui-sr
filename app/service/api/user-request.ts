import axiosInstance from "@/app/utils/axiosInstance";
import { UserRequestInput } from "@/app/validation/user-request";
import { RequestItem } from "../query/user-request";
import { format } from 'date-fns';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface UserRequestResponse {
  status: boolean;
  message: string;
  data: any; // You can type this more strictly if you want
}

// Response type for a single request
export interface SingleRequestResponse {
  status: boolean;
  message: string;
  data: RequestItem;
}

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

/**
 * Service for interacting with user request API endpoints
 */
export const userRequestService = {
  /**
   * Create a new user request
   * @param data - The user request input data
   * @returns Promise with the response
   */
  create: async (data: UserRequestInput): Promise<UserRequestResponse> => {
    const response = await axiosInstance.post<UserRequestResponse>(
      "/api/user-request",
      data
    );
    return response.data;
  },

  /**
   * Get a user request by ID
   * @param id - The user request ID
   * @returns Promise with the response containing the request details
   */
  getById: async (id: string): Promise<SingleRequestResponse> => {
    const response = await axiosInstance.get<SingleRequestResponse>(
      `/api/user-request/${id}`
    );
    return response.data;
  },

  /**
   * Update an existing user request
   * @param id - The user request ID
   * @param data - The updated user request data
   * @returns Promise with the response
   */
  update: async (
    id: string,
    data: Partial<UserRequestInput>
  ): Promise<UserRequestResponse> => {
    const response = await axiosInstance.put<UserRequestResponse>(
      `/api/user-request/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a user request
   * @param id - The user request ID to delete
   * @returns Promise with the response
   */
  delete: async (id: string): Promise<UserRequestResponse> => {
    const response = await axiosInstance.delete<UserRequestResponse>(
      `/api/user-request/${id}`
    );
    return response.data;
  },

  /**
   * Get other requests by depo
   * @param selectedDepo - The selected depo
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @param startDate - Start date for filtering (optional)
   * @param endDate - End date for filtering (optional)
   * @returns Promise with the response
   */
  getOtherRequests: async (
    selectedDepo: string,
    page: number = 1,
    limit: number = 100,
    startDate?: string,
    endDate?: string,
    userDepartement?:string
  ): Promise<RequestResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (userDepartement) queryParams.append('userDepartement', userDepartement);

    const response = await axiosInstance.get<RequestResponse>(
      `/api/user-request/other/${selectedDepo}?${queryParams.toString()}`
    );
    return response.data;
  },


  /**
   * Update other request status
   * @param id - The request ID
   * @param accept - Whether to accept the request
   * @param disconnectionRequestRejectRemarks - Remarks for rejection (required when rejecting)
   * @returns Promise with the response
   */
  // updateOtherRequest: async (
  //   id: string,
  //   accept: boolean,
  //   disconnectionRequestRejectRemarks?: string
  // ): Promise<UserRequestResponse> => {
  //   const url = `/api/user-request/other/${id}?accept=${accept}`;

  //   // If rejecting, include the rejection remarks in the request body
  //   const body =
  //     !accept && disconnectionRequestRejectRemarks
  //       ? { disconnectionRequestRejectRemarks }
  //       : undefined;

  //   const response = await axiosInstance.put<UserRequestResponse>(url, body);
  //   return response.data;
  // },


updateOtherRequest: async (
  id: string,
  accept: boolean,
  disconnectionRequestRejectRemarks?: string,
  userDepartement?: string,
  mobileView?: string
): Promise<UserRequestResponse> => {
  const url = `/api/user-request/other/${id}?accept=${accept}`;

  // Prepare request body based on parameters
  const body: any = {};
  
  if (!accept && disconnectionRequestRejectRemarks) {
    body.disconnectionRequestRejectRemarks = disconnectionRequestRejectRemarks;
  }
  
  if (userDepartement) {
    body.userDepartement = userDepartement;
  }

  if (mobileView) {
    body.mobileView = mobileView;
  }

  const response = await axiosInstance.put<UserRequestResponse>(
    url, 
    Object.keys(body).length > 0 ? body : undefined
  );
  return response.data;
},

  /**
   * Get user requests with pagination and date filtering
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @param startDate - Start date for filtering (YYYY-MM-DD)
   * @param endDate - End date for filtering (YYYY-MM-DD)
   * @param status - Optional status filter
   * @returns Promise with the response
   */
  getUserRequests: async (
    page: number = 1,
    limit: number = 10,
    startDate?: string,
    endDate?: string,
    status?: string
  ): Promise<RequestResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (status) params.append('status', status);

    const response = await axiosInstance.get<RequestResponse>(
      `/api/user-request/user?${params.toString()}`
    );
    return response.data;
  },

  downloadExcel: async (startDate: string, endDate: string) => {
    const response = await axiosInstance.get(`/api/user-request/download`, {
      params: {
        startDate,
        endDate
      },
      responseType: 'blob'
    });
    return response;
  },


  acceptUserRequestRemark: async (id: string) => {
    const response = await axiosInstance.put(`/api/user-request/accept/${id}`);
    return response.data;
  },

  rejectUserRequestRemark: async (id: string, remarks: string) => {
    const response = await axiosInstance.put(`/api/user-request/reject/${id}`, { remarks });
    return response.data;
  },
};
