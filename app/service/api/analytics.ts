import axiosInstance from "@/app/utils/axiosInstance";

export interface AnalyticsFilters {
    startDate?: string;
    endDate?: string;
    location?: string;
    department?: string;
}

function buildQuery(filters: AnalyticsFilters) {
    const params = new URLSearchParams();
    if (filters.startDate)  params.set("startDate",  filters.startDate);
    if (filters.endDate)    params.set("endDate",    filters.endDate);
    if (filters.location)   params.set("location",   filters.location);
    if (filters.department) params.set("department", filters.department);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
}

export const analyticsService = {
    getSummary: async (filters: AnalyticsFilters = {}) => {
        const r = await axiosInstance.get(`/api/analytics/summary${buildQuery(filters)}`);
        return r.data;
    },
    exportGap: async (filters: AnalyticsFilters, gapKey: string, status: string) => {
        const params = new URLSearchParams();
        params.set("gapKey", gapKey);
        params.set("status", status);
        if (filters.startDate)  params.set("startDate",  filters.startDate);
        if (filters.endDate)    params.set("endDate",    filters.endDate);
        if (filters.location)   params.set("location",   filters.location);
        if (filters.department) params.set("department", filters.department);
        const r = await axiosInstance.get(`/api/analytics/export-gap?${params.toString()}`);
        return r.data;
    },
};
