import axios from "axios";
import axiosInstance from "@/app/utils/axiosInstance";
import { MajorSection } from "@/app/lib/store";

export interface GenerateReportParams {
  startDate: string;
  endDate: string;
  majorSections: string[];
  department: string[];
  blockType: string[];
}

interface PastBlockSummary {
  SectionId: string;
  Section: string;
  Demanded: number;
  Approved: number;
  Granted: number;
  Availed: number;
  Percentage: number;
  DemandsCount?: number;
  ApprovedCount?: number;
  AvailedCount?: number;
}

interface UpcomingBlock {
  Date: string;
  Section: string;
  Duration: number;
  Type: string;
  Status: string;
  Department?: String;
  corridorType?: String;
}

export interface GenerateReportResponse {
  data: {
    sanctionedCounts?: any;
    pastBlockSummary?: PastBlockSummary[];
    detailedData: UpcomingBlock[];
  };
  message: string;
  status: boolean;
}

const BASE_URL = "api/hq";

// export const hqService = {
//   generateReport: async (params: GenerateReportParams): Promise<GenerateReportResponse> => {
//     // Format array parameters correctly for URL
//     const majorSections = params.majorSections.join(',');
//     const departments = params.department.join(',');
//     const blockTypes = params.blockType.join(',');

//     const response = await axiosInstance.get<GenerateReportResponse>(
//       `${BASE_URL}/generate-report?startDate=${params.startDate}&endDate=${params.endDate}&majorSections=${majorSections}&department=${departments}&blockType=${blockTypes}`,
//     );
//     console.log('response.data',response.data)
//     return response.data;
//   },
// };

export const hqService = {
  generateReport: async (
    params: GenerateReportParams
  ): Promise<GenerateReportResponse> => {
    // Special handling for S&T department only
    const departments = params.department
      .map((dept) => (dept === "S&T" ? "S%26T" : dept))
      .join(",");

    const response = await axiosInstance.get<GenerateReportResponse>(
      `${BASE_URL}/generate-report?startDate=${params.startDate}` +
        `&endDate=${params.endDate}` +
        `&majorSections=${params.majorSections.join(",")}` +
        `&department=${departments}` +
        `&blockType=${params.blockType.join(",")}`
    );
    return response.data;
  },
};
