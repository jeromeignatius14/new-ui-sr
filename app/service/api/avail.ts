import axiosInstance from "@/app/utils/axiosInstance";

export const availService = {
  // GET: Sanctioned blocks available for availing (JE/SSE, next N hours, by depot)
  getSanctionedBlocksForAvailing: async (depot: string, hours: number = 12) => {
    const response = await axiosInstance.get(
      `/api/avail/sanctioned-blocks?depot=${depot}&hours=${hours}`
    );
    return response.data;
  },

  // POST: JE/SSE applies for availing a sanctioned block
  applyForAvailing: async (requestId: string, oheMasFrom: string, oheMasTo: string) => {
    const response = await axiosInstance.post("/api/avail/apply", {
      requestId,
      oheMasFrom,
      oheMasTo,
      mobileView: true,
    });
    return response.data;
  },

  // GET: Other-dept pending availing concurrences for this SSE
  getPendingConcurrences: async (depot: string, userDepartement: string) => {
    const response = await axiosInstance.get(
      `/api/avail/pending-concurrences?depot=${depot}&userDepartement=${userDepartement}`
    );
    return response.data;
  },

  // PUT: SSE submits availing concurrence (accept or reject)
  submitAvailConcurrence: async (
    requestId: string,
    accept: boolean,
    acceptRemarks?: string,
    rejectRemarks?: string,
    userDepartement?: string
  ) => {
    const body: Record<string, any> = { userDepartement, mobileView: true };
    if (accept && acceptRemarks) body.acceptRemarks = acceptRemarks;
    if (!accept && rejectRemarks) body.rejectRemarks = rejectRemarks;
    const response = await axiosInstance.put(
      `/api/avail/concurrence/${requestId}?accept=${accept}`,
      body
    );
    return response.data;
  },

  // GET: SM pending approvals and closures for their station
  getSmPending: async (stationCode: string) => {
    const response = await axiosInstance.get(
      `/api/avail/sm/pending?stationCode=${stationCode}`
    );
    return response.data;
  },

  // PUT: SM approves/rejects availing (optionally with time modification)
  smApproveAvail: async (
    requestId: string,
    action: "APPROVE" | "APPROVE_WITH_MODIFICATION" | "REJECT",
    payload: {
      smApprovedTimeFrom?: string;
      smApprovedTimeTo?: string;
      smRemarks?: string;
    }
  ) => {
    const response = await axiosInstance.put(
      `/api/avail/sm/approve/${requestId}`,
      { action, ...payload, mobileView: true }
    );
    return response.data;
  },

  // PUT: SSE/JE accepts or rejects SM's time modification
  sseRespondToSmModification: async (requestId: string, accept: boolean) => {
    const response = await axiosInstance.put(
      `/api/avail/sse-response/${requestId}`,
      { accept, mobileView: true }
    );
    return response.data;
  },

  // POST: Start availing (with geo check — bypassed until OHE GPS data is available)
  startAvailing: async (
    requestId: string,
    latitude: number | null,
    longitude: number | null,
    geoCheckBypassed: boolean
  ) => {
    const response = await axiosInstance.post(`/api/avail/start/${requestId}`, {
      latitude,
      longitude,
      geoCheckBypassed,
      mobileView: true,
    });
    return response.data;
  },

  // POST: SSE/JE closes the block after work is done
  closeBlock: async (requestId: string, closureYard: string, closureRemarks: string) => {
    const response = await axiosInstance.post(`/api/avail/close/${requestId}`, {
      closureYard,
      closureRemarks,
      mobileView: true,
    });
    return response.data;
  },

  // PUT: SM acknowledges and finalizes block closure
  smAcknowledgeClosure: async (requestId: string, smClosureRemarks: string) => {
    const response = await axiosInstance.put(
      `/api/avail/sm/close-ack/${requestId}`,
      { smClosureRemarks, mobileView: true }
    );
    return response.data;
  },

  // GET: Single availing request detail (includes all new availing fields)
  getAvailRequestById: async (requestId: string) => {
    const response = await axiosInstance.get(`/api/avail/request/${requestId}`);
    return response.data;
  },

  // GET: All of the logged-in user's blocks in any availing status
  getMyAvailBlocks: async () => {
    const response = await axiosInstance.get("/api/avail/my-blocks");
    return response.data;
  },

  // POST: SSE requests time extension while block is in progress
  requestExtension: async (requestId: string, newEndTime: string, remarks?: string) => {
    const response = await axiosInstance.post(`/api/avail/request-extension/${requestId}`, {
      newEndTime,
      remarks,
      mobileView: true,
    });
    return response.data;
  },

  // PUT: SM approves or rejects a time extension request
  smApproveExtension: async (
    requestId: string,
    action: "APPROVE" | "REJECT",
    smRemarks?: string
  ) => {
    const response = await axiosInstance.put(`/api/avail/sm/extension/${requestId}`, {
      action,
      smRemarks,
      mobileView: true,
    });
    return response.data;
  },
};
