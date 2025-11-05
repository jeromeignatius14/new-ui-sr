import axiosInstance from '@/app/utils/axiosInstance';

export const adminService = {
  acceptUserRequest: async (id: string, accept: boolean,remark?:string) => {
    const response = await axiosInstance.put(
      `/api/user-request/admin/accept/${id}?accept=${accept}`,
      { adminRequestStatus: accept ? "ACCEPTED" : "REJECTED",remark,isMobileView:"mobileView" }
    );
    return response.data;
  },
  getApprovedRequests: async (
    startDate: string,
    endDate: string,
    limit: number = 5000,
  ) => {
    const response = await axiosInstance.get(
      `/api/user-request/admin/approved?startDate=${startDate}&endDate=${endDate}&limit=${limit}`
    );
    return response.data;
  },
  getOptimizeRequests: async (
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number
  ) => {
    const response = await axiosInstance.get(
      `/api/user-request/admin/optimized?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`
    );
    return response.data;
  },
  approveAllPendingRequests: async () => {
    const response = await axiosInstance.put(
      `/api/user-request/admin/approve-all-pending`
    );
    return response.data;
  },


  saveOptimizedRequests: async (optimizedData: any) => {
    const response = await axiosInstance.post(
      '/api/user-request/admin/save-optimized-requests',
      { optimizedData }
    );
    return response.data;
  },

  saveOptimizedRequestsCombined: async (data: any) => {
    const response = await axiosInstance.post(
      '/api/user-request/admin/save-optimized-requests-combined',
      data
    );
    return response.data;
  },
  
  saveOptimizedRequestsStatus: async (requestIds: string[]) => {
    const response = await axiosInstance.put(
      '/api/user-request/admin/save-optimized-requests-status',
      { requestIds }
    );
    return response.data;
  },



  sanctionOptimisedRequests: async (requestIds: any) => {
    const response = await axiosInstance.put(
      '/api/user-request/admin/sanction',
      { requestIds }
    );
    return response.data;
  },


  getUserRequests: async (page: number, limit: number, startDate: string,
    endDate: string,) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      if (startDate && endDate) {
        queryParams.append('startDate', startDate);
        queryParams.append('endDate', endDate);
      }
      const response = await axiosInstance.get("/api/user-request/user-data", {
        params: { page, limit, startDate, endDate },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user requests:", error);
      throw error;
    }
  },

  updateRequestStatus: async (requestId: string, status: 'yes' | 'no', reason: string) => {
    try {
      const response = await axiosInstance.post("/api/user-request/updatedStatus", {
        requestId,
        status,
        reason
      });
      return response.data;
    } catch (error: any) {
      console.error("Error updating user status:", error);
      throw new Error(error.response?.data?.message || "Failed to update status");
    }
  },





  updateUserResponse: async (requestId: string, userResponse: string, reason: string) => {
    try {
      const response = await axiosInstance.post("/api/user-request/userResponse", {
        requestId,
        userResponse,
        reason
      });
      return response.data;
    } catch (error: any) {
      console.error("Error updating user status:", error);
      throw new Error(error.response?.data?.message || "Failed to update status");
    }
  },

  updateSanctionStatus: async (requests: any) => {
    try {
      const response = await axiosInstance.post("/api/user-request/updateSanctionStatus",
        { requests } // Send as { requests: [...] }
      );
      return response.data;
    } catch (error) {
      console.error('Error in updateSanctionStatus:', error);
      throw error;
    }
  },
    updateDraftStatus: async (requests: any) => {
    try {
      const response = await axiosInstance.post("/api/user-request/updateDraftStatus",
        { requests } 
      );
      return response.data;
    } catch (error) {
      console.error('Error in updateSanctionStatus:', error);
      throw error;
    }
  },
  // In your adminService.ts
  deleteRequest: async (requestId: string) => {
    return axiosInstance.delete(`/api/user-request/delet-optimiseData/${requestId}`);
  },

  // In your adminService
  updateOptimizeTimes: async (data: {
    requestId: string;
    optimizeTimeFrom: string;
    optimizeTimeTo: string;
  }) => {
    try {
      // Validate the datetime strings
      const fromDate = new Date(data.optimizeTimeFrom);
      const toDate = new Date(data.optimizeTimeTo);

      if (isNaN(fromDate.getTime())) throw new Error("Invalid optimizeTimeFrom");
      if (isNaN(toDate.getTime())) throw new Error("Invalid optimizeTimeTo");

      const response = await axiosInstance.post("/api/user-request/updateOptimizeTimes", {
        requestId: data.requestId,
        optimizeTimeFrom: fromDate.toISOString(),
        optimizeTimeTo: toDate.toISOString()
      });
      return response.data;
    } catch (error: any) {
      console.error("Error updating optimize times:", error);
      throw new Error(error.response?.data?.message || "Failed to update optimize times");
    }
  },

  editRequest: async (id: string, updateData: { optimizeTimeFrom?: string; optimizeTimeTo?: string; date?: string }) => {
    const response = await axiosInstance.put(
      `/api/user-request/admin/edit/${id}`,
      updateData
    );
    return response.data;
  },

  updateRequest: async (data: {
    requestId: string;
    optimizeTimeFrom: string;
    optimizeTimeTo: string;
    newDate: string;
    sanctionedRemark?:string;
  }) => {
    try {
      const response = await axiosInstance.post("/api/user-request/editRequest", {
        requestId: data.requestId,
        optimizeTimeFrom: data.optimizeTimeFrom,
        optimizeTimeTo: data.optimizeTimeTo,
        date: data.newDate, // <-- send 'date' field here
        mobileView: true, // Assuming you want to include this field
        sanctionedRemark: data.sanctionedRemark
      });
      return response.data;
    } catch (error: any) {
      console.error("Error updating optimize times:", error);
      throw new Error(error.response?.data?.message || "Failed to update optimize times");
    }
  },
};
