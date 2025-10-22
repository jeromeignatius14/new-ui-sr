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
  DemandsCount?: number;
  ApprovedCount?: number;
  AvailedCount?: number;
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

// const BASE_URL = "api/drm";

// export const drmService = {
//   generateReport: async (
//     params: GenerateReportParams
//   ): Promise<GenerateReportResponse> => {
//     // Format array parameters correctly for URL
//     const locations = params.location.join(",");
//     const departments = params.department.join(",");
//     const blockTypes = params.blockType.join(",");

//     const response = await axiosInstance.get<GenerateReportResponse>(
//       `${BASE_URL}/generate-report?startDate=${params.startDate}&endDate=${params.endDate}&location=${locations}&department=${departments}&blockType=${blockTypes}`
//     );
//     console.log("response.data", response.data);
//     return response.data;
//   },
// };


const BASE_URL = "api/drm";
const EXTERNAL_URL = process.env.NEXT_PUBLIC_BACKEND_URL_OTHER;

export const drmService = {
  generateReport: async (params: GenerateReportParams): Promise<GenerateReportResponse> => {

    const locations = params.location.join(",");
    const departments = params.department.join(",");
    const blockTypes = params.blockType.join(",");

    const isMAS = params.location.length === 1 && params.location[0] === "MAS";

    let url = "";

    if (isMAS) {
      // ✅ Call existing API
      url = `${BASE_URL}/generate-report?startDate=${params.startDate}&endDate=${params.endDate}&location=${locations}&department=${departments}&blockType=${blockTypes}`;
      const response = await axiosInstance.get<GenerateReportResponse>(url);
      return response.data;
    } 
    else {
      // ✅ Call external backend
      url = `${EXTERNAL_URL}/api/drm/generate-report?startDate=${params.startDate}&endDate=${params.endDate}&location=${locations}&department=${departments}&blockType=${blockTypes}`;
      const response = await axios.get<GenerateReportResponse>(url);
      return response.data;
    }
  },
};
