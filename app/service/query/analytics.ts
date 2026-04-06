import { useQuery } from "@tanstack/react-query";
import { analyticsService, AnalyticsFilters } from "../api/analytics";

export const useAnalyticsSummary = (filters: AnalyticsFilters = {}) =>
    useQuery({
        queryKey: ["analytics-summary", filters],
        queryFn:  () => analyticsService.getSummary(filters),
        staleTime: 5 * 60 * 1000, // 5 min
    });
