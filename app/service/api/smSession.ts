import axiosInstance, { axiosPublicInstance } from "@/app/utils/axiosInstance";

export const smSessionApi = {
  check: (station: string) =>
    axiosPublicInstance.get(`/api/sm-session/check?station=${encodeURIComponent(station)}`),

  register: (data: { stationCode: string; userId: string; userName: string; userPhone?: string }) =>
    axiosPublicInstance.post("/api/sm-session/register", data),

  forceLogout: (station: string) =>
    axiosPublicInstance.post("/api/sm-session/force-logout", { station }),

  verify: (station: string) =>
    axiosInstance.get(`/api/avail/sm-session/verify?station=${encodeURIComponent(station)}`),
};
