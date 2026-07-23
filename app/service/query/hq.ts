import { useQuery } from "@tanstack/react-query";

import { hqService } from "../api/hq";

// Import the shared interfaces from the API service
import { GenerateReportParams, GenerateReportResponse } from "../api/hq";

// No need to redefine GenerateReportParams here as we're importing it

export const useGenerateReport = (params: GenerateReportParams) => {
    return useQuery({
        queryKey: ["generate-report", params],
        queryFn: () => hqService.generateReport(params),
        enabled: !!params.startDate && !!params.endDate,
    });
};
