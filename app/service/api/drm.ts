import axios from "axios";
import axiosInstance from "@/app/utils/axiosInstance";

export interface GenerateReportParams {
  startDate: string;
  endDate: string;
  location: string[];
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
  MissionBlockCount: number;
}

interface UpcomingBlock {
  Date: string;
  Section: string;
  Duration: number;
  stationId?: string;
  AvailedTimeFrom?: string;
  AvailedTimeTo?: string;
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

const BASE_URL = "api/drm";

export const drmService = {
  generateReport: async (
    params: GenerateReportParams
  ): Promise<GenerateReportResponse> => {
    // Format array parameters correctly for URL
    const locations = params.location.join(",");
    const departments = params.department.join(",");
    const blockTypes = params.blockType.join(",");

    const response = await axiosInstance.get<GenerateReportResponse>(
      `${BASE_URL}/generate-report?startDate=${params.startDate}&endDate=${params.endDate}&location=${locations}&department=${departments}&blockType=${blockTypes}`
    );
    console.log("response.data", response.data);
    return response.data;
  },
};
