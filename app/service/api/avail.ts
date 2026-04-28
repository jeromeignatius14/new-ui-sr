import axiosInstance from "@/app/utils/axiosInstance";

export const availService = {
  // GET: All sanctioned + applied blocks for a depot (visible to everyone in that depot)
  getDepotBlocks: async (depot: string) => {
    const response = await axiosInstance.get(`/api/avail/depot-blocks?depot=${encodeURIComponent(depot)}`);
    return response.data;
  },

  // GET: Blocks where I'm an AvailParticipant (my active availing participations)
  getMyParticipations: async () => {
    const response = await axiosInstance.get("/api/avail/my-participations");
    return response.data;
  },

  // GET: Pending concurrences for my dept/depot
  getPendingConcurrences: async (depot: string, userDepartment: string) => {
    const params = new URLSearchParams({ depot, userDepartment });
    const response = await axiosInstance.get(`/api/avail/pending-concurrences?${params}`);
    return response.data;
  },

  // GET: All SM station codes
  getSmStations: async () => {
    const response = await axiosInstance.get("/api/avail/sm-stations");
    return response.data;
  },

  // POST: Apply for availing a sanctioned block (with user-specified times)
  applyForAvailing: async (payload: {
    requestId: string;
    requestedTimeFrom?: string;
    requestedTimeTo?: string;
    smStation?: string;
    oheMasFrom?: string;
    oheMasTo?: string;
  }) => {
    const response = await axiosInstance.post("/api/avail/apply", { ...payload, mobileView: true });
    return response.data;
  },

  // PUT: Give concurrence (accept or reject)
  submitConcurrence: async (
    requestId: string,
    accept: boolean,
    remarks?: string,
    userDepartment?: string
  ) => {
    const response = await axiosInstance.put(
      `/api/avail/concurrence/${requestId}?accept=${accept}`,
      { remarks, userDepartment, mobileView: true }
    );
    return response.data;
  },

  // PUT: Acknowledge SM's grant
  acknowledgeSmGrant: async (requestId: string, accept: boolean, remarks?: string, lat?: number, lng?: number, geoOverride?: boolean) => {
    const response = await axiosInstance.put(`/api/avail/acknowledge/${requestId}`, {
      accept, remarks, lat, lng, geoOverride: geoOverride ?? false, mobileView: true,
    });
    return response.data;
  },

  // POST: Start availing (this participant)
  startAvailing: async (requestId: string, lat?: number, lng?: number, geoOverride?: boolean) => {
    const response = await axiosInstance.post(`/api/avail/start/${requestId}`, { lat, lng, geoOverride: geoOverride ?? false, mobileView: true });
    return response.data;
  },

  // POST: Close block (this participant)
  closeBlock: async (
    requestId: string,
    closureRemarks?: string,
    closureImage?: File | null,
    closureReconnectedSignal?: string,
    closureCautionKmph?: string,
    closureOheMadeFit?: boolean,
    lat?: number,
    lng?: number,
    geoOverride?: boolean,
    closureAckSmStation?: string,
  ) => {
    const form = new FormData();
    if (closureRemarks) form.append("closureRemarks", closureRemarks);
    if (closureImage) form.append("closureImage", closureImage);
    if (closureReconnectedSignal) form.append("closureReconnectedSignal", closureReconnectedSignal);
    if (closureCautionKmph) form.append("closureCautionKmph", closureCautionKmph);
    form.append("closureOheMadeFit", closureOheMadeFit ? "true" : "false");
    if (lat != null) form.append("lat", String(lat));
    if (lng != null) form.append("lng", String(lng));
    form.append("geoOverride", geoOverride ? "true" : "false");
    if (closureAckSmStation) form.append("closureAckSmStation", closureAckSmStation);
    const response = await axiosInstance.post(`/api/avail/close/${requestId}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // POST: Request time extension
  requestExtension: async (
    requestId: string,
    newEndTime: string,
    remarks?: string,
    isEmergency?: boolean,
    emergencyReason?: string,
    lat?: number,
    lng?: number,
    geoOverride?: boolean,
  ) => {
    const response = await axiosInstance.post(`/api/avail/request-extension/${requestId}`, {
      newEndTime, remarks,
      isEmergency: isEmergency ?? false,
      emergencyReason: isEmergency ? emergencyReason : undefined,
      lat, lng, geoOverride: geoOverride ?? false,
      mobileView: true,
    });
    return response.data;
  },

  // GET: Single avail request detail
  getAvailRequestById: async (requestId: string) => {
    const response = await axiosInstance.get(`/api/avail/request/${requestId}`);
    return response.data;
  },

  // GET: Geo-fence pre-check before submitting an action
  geoCheck: async (station: string, lat: number, lng: number) => {
    const response = await axiosInstance.get(
      `/api/avail/geo-check?station=${encodeURIComponent(station)}&lat=${lat}&lng=${lng}`
    );
    return response.data?.data as { insideFence: boolean; distanceMeters: number | null; fenceFound: boolean };
  },

  // ── SM endpoints ──────────────────────────────────────────────────────────

  // GET: SM dashboard data
  getSmPending: async (stationCode: string) => {
    const response = await axiosInstance.get(`/api/avail/sm/pending?stationCode=${stationCode}`);
    return response.data;
  },

  // PUT: SM grants times (approve / modify / reject)
  smApproveAvail: async (
    requestId: string,
    action: "APPROVE" | "APPROVE_WITH_MODIFICATION" | "REJECT",
    payload: { smApprovedTimeFrom?: string; smApprovedTimeTo?: string; smRemarks?: string }
  ) => {
    const response = await axiosInstance.put(`/api/avail/sm/approve/${requestId}`, {
      action, ...payload, mobileView: true,
    });
    return response.data;
  },

  // PUT: SM approves or rejects a participant's extension
  smApproveExtension: async (
    requestId: string,
    participantId: string,
    action: "APPROVE" | "REJECT",
    smRemarks?: string
  ) => {
    const response = await axiosInstance.put(`/api/avail/sm/extension/${requestId}`, {
      participantId, action, smRemarks, mobileView: true,
    });
    return response.data;
  },

  // PUT: SM acknowledges final closure
  smAcknowledgeClosure: async (requestId: string, smClosureRemarks: string) => {
    const response = await axiosInstance.put(`/api/avail/sm/close-ack/${requestId}`, {
      smClosureRemarks, mobileView: true,
    });
    return response.data;
  },

  // ── TRD Controller endpoints ──────────────────────────────────────────────

  // GET: TRD Controller permit dashboard
  getTrdPending: async () => {
    const response = await axiosInstance.get("/api/avail/trd/pending");
    return response.data;
  },

  // PUT: TRD Controller permits/rejects availing
  trdPermitAvail: async (
    requestId: string,
    action: "APPROVE" | "APPROVE_WITH_MODIFICATION" | "REJECT",
    payload: { smApprovedTimeFrom?: string; smApprovedTimeTo?: string; smRemarks?: string }
  ) => {
    const response = await axiosInstance.put(`/api/avail/trd/permit/${requestId}`, {
      action, ...payload, mobileView: true,
    });
    return response.data;
  },

  // PUT: TRD Controller approves/rejects extension
  trdApproveExtension: async (
    requestId: string,
    participantId: string,
    action: "APPROVE" | "REJECT",
    smRemarks?: string
  ) => {
    const response = await axiosInstance.put(`/api/avail/trd/extension/${requestId}`, {
      participantId, action, smRemarks, mobileView: true,
    });
    return response.data;
  },

  // PUT: TRD Controller acknowledges final closure
  trdAcknowledgeClosure: async (requestId: string, smClosureRemarks: string) => {
    const response = await axiosInstance.put(`/api/avail/trd/close-ack/${requestId}`, {
      smClosureRemarks, mobileView: true,
    });
    return response.data;
  },

  // POST: Exit without availing (cancel before applying)
  exitWithoutAvailing: async (requestId: string, reason: string) => {
    const response = await axiosInstance.post(`/api/avail/exit-without-availing/${requestId}`, { reason });
    return response.data;
  },
};
